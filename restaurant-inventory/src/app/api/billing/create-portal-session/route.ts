import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { businessProfileId, returnUrl } = await request.json();

    if (!businessProfileId) {
      return NextResponse.json(
        { error: 'Missing business profile ID' },
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

    // Get the Stripe customer ID for this business
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('business_profile_id', businessProfileId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (subscriptionError || !subscription || subscription.length === 0 || !subscription[0].stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found for this business' },
        { status: 404 }
      );
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription[0].stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Error creating portal session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create portal session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
