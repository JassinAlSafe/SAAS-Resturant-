import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { priceId, businessProfileId, businessId, successUrl, cancelUrl, productId } = body;
    
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

    // Check if the user already has a Stripe customer ID
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
    let customerId: string | undefined = undefined;
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

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          businessProfileId: profileId,
          productId: productId || '',
        },
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?canceled=true`,
      metadata: {
        businessId: profileId, // Keep this for backward compatibility
        businessProfileId: profileId,
        userId: user.id
      },
      customer: customerId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
