import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get the business profile ID from the URL
    const url = new URL(request.url);
    const businessProfileId = url.searchParams.get('businessProfileId');

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

    // Get the business profile with subscription details
    const { data: profile, error: profileDataError } = await supabase
      .from('business_profiles')
      .select('subscription_id, subscription_plan, subscription_status, subscription_current_period_end')
      .eq('id', businessProfileId)
      .single();

    if (profileDataError || !profile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }

    // If there's a subscription ID, get more details from Stripe
    let subscriptionDetails = null;
    if (profile.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(profile.subscription_id);
        
        // Get the product details
        const productId = subscription.items.data[0].price.product;
        const product = await stripe.products.retrieve(productId as string);
        
        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          plan: product.name,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          priceId: subscription.items.data[0].price.id,
          amount: subscription.items.data[0].price.unit_amount,
          currency: subscription.items.data[0].price.currency,
          interval: subscription.items.data[0].price.recurring?.interval,
          intervalCount: subscription.items.data[0].price.recurring?.interval_count,
        };
      } catch (stripeError) {
        console.error('Error retrieving subscription from Stripe:', stripeError);
        // Continue with the data we have from the database
      }
    }

    return NextResponse.json({
      subscription: {
        ...profile,
        details: subscriptionDetails
      }
    });
  } catch (error: any) {
    console.error('Error retrieving subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve subscription' },
      { status: 500 }
    );
  }
}
