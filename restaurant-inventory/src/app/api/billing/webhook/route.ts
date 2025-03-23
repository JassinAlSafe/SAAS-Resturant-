import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    // Get the raw request body
    const payload = await request.text();
    
    // Get the Stripe signature header
    const headers = request.headers;
    const signature = headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const businessProfileId = session.metadata?.businessProfileId || session.metadata?.businessId;
          
          if (businessProfileId) {
            // Update the business profile with the subscription info
            await handleCheckoutCompleted(session);
          }
          break;
        }
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionChange(subscription);
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCanceled(subscription);
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(invoice);
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoiceFailed(invoice);
          break;
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook event:', error);
      return NextResponse.json(
        { error: 'Error handling webhook event' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return NextResponse.json(
      { error: 'Error in webhook handler' },
      { status: 500 }
    );
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const businessProfileId = session.metadata?.businessProfileId || session.metadata?.businessId;
  const subscriptionId = session.subscription;
  
  if (!businessProfileId || !subscriptionId) return;
  
  try {
    // Get the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId as string
    );
    
    // Get the price and product details
    const priceId = subscription.items.data[0]?.price.id;
    const productId = subscription.items.data[0]?.price.product as string;
    
    // Update the business profile with the subscription info
    await supabase
      .from('business_profiles')
      .update({
        subscription_id: subscriptionId,
        subscription_status: subscription.status,
        subscription_price_id: priceId,
        subscription_product_id: productId,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', businessProfileId);
      
    // Record the subscription in our subscriptions table
    await supabase
      .from('subscriptions')
      .upsert({
        business_profile_id: businessProfileId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        plan_name: (await stripe.products.retrieve(productId)).name,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'stripe_subscription_id'
      });
      
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const businessProfileId = subscription.metadata?.businessProfileId || subscription.metadata?.businessId;
  
  if (!businessProfileId) {
    // Try to find the business profile from our database
    const { data } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .single();
      
    if (data) {
      await updateSubscriptionInDatabase(data.id, subscription);
    }
  } else {
    await updateSubscriptionInDatabase(businessProfileId, subscription);
  }
}

// Update subscription details in database
async function updateSubscriptionInDatabase(businessProfileId: string, subscription: Stripe.Subscription) {
  try {
    // Get the price and product details
    const priceId = subscription.items.data[0]?.price.id;
    
    if (!priceId) {
      console.error('No price ID found in subscription');
      return;
    }
    
    // Get the price details
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    });
    
    const productName = (price.product as Stripe.Product).name || 'Unknown Plan';
    
    // Prepare subscription data
    const subscriptionData = {
      business_profile_id: businessProfileId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: priceId,
      plan_name: productName,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    };
    
    // Update the subscription in the database
    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { 
        onConflict: 'stripe_subscription_id'
      });
    
    if (error) {
      console.error('Error updating subscription in database:', error);
    }
    
    // Also update the business profile with the subscription status
    const { error: profileError } = await supabase
      .from('business_profiles')
      .update({
        subscription_plan: productName.toLowerCase(),
        subscription_status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessProfileId);
    
    if (profileError) {
      console.error('Error updating business profile:', profileError);
    }
  } catch (error) {
    console.error('Error in updateSubscriptionInDatabase:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  
  try {
    // Find the business profile with this subscription
    const { data } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .single();
      
    if (data) {
      // Update the business profile
      await supabase
        .from('business_profiles')
        .update({
          subscription_status: 'canceled',
          subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
      // Update the subscription record
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: false,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;
  
  try {
    // Find the business profile with this subscription
    const { data } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .single();
      
    if (data) {
      // Record the payment
      await supabase
        .from('subscription_payments')
        .insert({
          business_profile_id: data.id,
          subscription_id: subscriptionId,
          invoice_id: invoice.id,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          payment_intent: invoice.payment_intent,
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error handling invoice payment:', error);
    throw error;
  }
}

// Handle failed invoice payment
async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;
  
  try {
    // Find the business profile with this subscription
    const { data } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .single();
      
    if (data) {
      // Update the business profile
      await supabase
        .from('business_profiles')
        .update({
          subscription_status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
      // Record the failed payment
      await supabase
        .from('subscription_payments')
        .insert({
          business_profile_id: data.id,
          subscription_id: subscriptionId,
          invoice_id: invoice.id,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          status: 'failed',
          payment_intent: invoice.payment_intent,
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error handling invoice failure:', error);
    throw error;
  }
}
