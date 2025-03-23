import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { userId, businessProfileId, planName = 'Pro', priceId = 'price_XXXX', productId = 'prod_RzCVIogVpsmUTr' } = body;
    
    // Validate required parameters
    if (!userId || !businessProfileId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Insert a test subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        business_profile_id: businessProfileId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cancel_at_period_end: false,
        billing_interval: 'month',
        stripe_subscription_id: `sub_mock_${Date.now()}`,
        stripe_customer_id: `cus_mock_${Date.now()}`,
        stripe_price_id: priceId,
        plan_name: planName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error inserting subscription:', subscriptionError);
      return NextResponse.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }

    // Update the business profile with subscription information
    const { data: profile, error: profileError } = await supabase
      .from('business_profiles')
      .update({
        subscription_plan: planName.toLowerCase(),
        subscription_status: 'active',
        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_price_id: priceId,
        subscription_product_id: productId
      })
      .eq('id', businessProfileId)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating business profile:', profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      subscription,
      profile
    });
  } catch (error: any) {
    console.error('Error creating test subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test subscription' },
      { status: 500 }
    );
  }
}
