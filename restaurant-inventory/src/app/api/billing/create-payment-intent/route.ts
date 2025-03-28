import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // Get the request body
        const body = await request.json();
        const { priceId, businessProfileId, businessId } = body;

        // Support both businessProfileId and businessId for backward compatibility
        const profileId = businessProfileId || businessId;

        // Validate required parameters
        if (!priceId) {
            return NextResponse.json(
                { error: 'Missing priceId parameter' },
                { status: 400 }
            );
        }

        if (!profileId) {
            return NextResponse.json(
                { error: 'Missing business profile ID parameter' },
                { status: 400 }
            );
        }

        // Get the authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify the user has access to this business profile
        const { data: profileAccess, error: profileError } = await supabase
            .from('business_profile_users')
            .select('role')
            .eq('user_id', user.id)
            .eq('business_profile_id', profileId)
            .single();

        if (profileError || !profileAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this business profile' },
                { status: 403 }
            );
        }

        // Get the price from Stripe
        const price = await stripe.prices.retrieve(priceId);
        if (!price) {
            return NextResponse.json(
                { error: 'Price not found' },
                { status: 404 }
            );
        }

        // Check if the user already has a Stripe customer ID
        let customerId: string | undefined = undefined;

        // Get the business profile
        const { data: businessProfile } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (!businessProfile) {
            return NextResponse.json(
                { error: 'Business profile not found' },
                { status: 404 }
            );
        }

        // Check if there's an existing subscription with a customer ID
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('business_profile_id', profileId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (existingSubscription && existingSubscription.length > 0 && existingSubscription[0].stripe_customer_id) {
            customerId = existingSubscription[0].stripe_customer_id;
        } else {
            // If no existing subscription, create a new customer
            const customer = await stripe.customers.create({
                email: user.email,
                name: businessProfile.name,
                metadata: {
                    businessProfileId: profileId,
                    userId: user.id
                }
            });
            customerId = customer.id;
        }

        // Get the product information
        const product = await stripe.products.retrieve(price.product as string);

        // Create a SetupIntent or PaymentIntent depending on the scenario
        // For subscriptions, we generally use a SetupIntent to collect card details
        // and then a separate call to create the subscription when the payment method is confirmed
        if (price.type === 'recurring') {
            // For subscriptions, create a SetupIntent first to securely collect payment details
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
                metadata: {
                    businessProfileId: profileId,
                    priceId: priceId,
                    productId: price.product as string,
                    userId: user.id,
                    interval: price.recurring?.interval || 'month', // Defaults to month if undefined
                },
            });

            return NextResponse.json({
                clientSecret: setupIntent.client_secret,
                customerId: customerId,
                setupIntentId: setupIntent.id,
                priceId: priceId,
                productName: product.name,
                interval: price.recurring?.interval,
                amount: price.unit_amount,
                currency: price.currency,
            });
        } else {
            // For one-time payments, create a PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: price.unit_amount || 0,
                currency: price.currency,
                customer: customerId,
                metadata: {
                    businessProfileId: profileId,
                    priceId: priceId,
                    productId: price.product as string,
                    userId: user.id
                },
                description: `Payment for ${product.name}`,
            });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret,
                customerId: customerId,
                paymentIntentId: paymentIntent.id,
                priceId: priceId,
                productName: product.name,
                amount: price.unit_amount,
                currency: price.currency,
            });
        }
    } catch (error: unknown) {
        console.error('Error creating payment intent:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
} 