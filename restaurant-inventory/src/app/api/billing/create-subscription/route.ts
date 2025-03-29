import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // Get the request body
        const body = await request.json();
        const {
            setupIntentId,
            priceId,
            customerId,
            businessProfileId,
            paymentMethodId
        } = body;

        // Validate required parameters
        if (!setupIntentId || !priceId || !customerId || !businessProfileId || !paymentMethodId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
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
            .eq('business_profile_id', businessProfileId)
            .single();

        if (profileError || !profileAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this business profile' },
                { status: 403 }
            );
        }

        // Set the payment method as the default for the customer
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Create the subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            },
            metadata: {
                businessProfileId,
                userId: user.id,
                setupIntentId,
            },
        });

        return NextResponse.json({
            subscriptionId: subscription.id,
            status: subscription.status,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
    } catch (error: unknown) {
        console.error('Error creating subscription:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
} 