/**
 * Service for handling billing operations with Stripe
 */

// Types for billing operations
export interface SubscriptionDetails {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  amount: number | null;
  currency: string;
  interval: string | undefined;
  intervalCount: number | undefined;
}

export interface Subscription {
  id?: string;
  status?: string;
  priceId?: string;
  productId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  error?: string;
  subscription_id?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription_current_period_end?: string | null;
  details?: SubscriptionDetails | null;
}

export interface CheckoutSessionParams {
  priceId: string;
  productId?: string;
  businessProfileId?: string;
  businessId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PortalSessionParams {
  businessProfileId?: string;
  businessId?: string;
  returnUrl?: string;
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string }> {
  const response = await fetch('/api/billing/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Create a Stripe customer portal session for managing subscription
 */
export async function createPortalSession(params: PortalSessionParams): Promise<{ url: string }> {
  const response = await fetch('/api/billing/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create portal session');
  }

  return response.json();
}

/**
 * Get subscription details for a business profile
 */
export async function getSubscription(businessId: string): Promise<Subscription> {
  // Support both query parameter names for backward compatibility
  const response = await fetch(`/api/billing/get-subscription?businessId=${businessId}&businessProfileId=${businessId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retrieve subscription');
  }

  const data = await response.json();
  return data.subscription;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (amount === null) return 'N/A';
  
  // Convert from cents to dollars for display
  const dollars = amount / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(dollars);
}

/**
 * Format subscription interval for display
 */
export function formatInterval(interval: string | undefined, count: number | undefined): string {
  if (!interval) return 'N/A';
  
  const intervalStr = interval.charAt(0).toUpperCase() + interval.slice(1);
  
  if (count && count > 1) {
    return `${count} ${intervalStr}s`;
  }
  
  return intervalStr + 'ly';
}
