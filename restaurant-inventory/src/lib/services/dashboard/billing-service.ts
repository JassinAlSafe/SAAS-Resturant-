import { supabase } from "@/lib/supabase";

// Types for billing data
export interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  plan?: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface Invoice {
  id: string;
  status: string;
  amount_paid: number;
  currency: string;
  created: number;
  number: string;
  url: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

/**
 * Get the current subscription for a business profile
 */
export async function getSubscription(businessProfileId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get payment methods for a business profile
 */
export async function getPaymentMethods(businessProfileId: string): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('business_profile_id', businessProfileId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
}

/**
 * Get invoices for a business profile
 */
export async function getInvoices(businessProfileId: string): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .order('created', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

/**
 * Get available subscription plans
 */
export async function getAvailablePlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    
    // Add features array to each plan
    return (data || []).map(plan => ({
      ...plan,
      features: plan.features ? JSON.parse(plan.features) : []
    }));
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(planId: string, interval: string): Promise<{ url: string } | null> {
  try {
    const response = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        interval,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/billing/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
}
