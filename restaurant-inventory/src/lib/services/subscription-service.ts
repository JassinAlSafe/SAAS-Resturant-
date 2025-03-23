import {
    SubscriptionPlan,
    Subscription,
    PaymentMethod,
    Invoice,
    InvoiceItem
} from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Track the billing interval for proper price display
let billingInterval: 'monthly' | 'yearly' = 'monthly';

// Helper function to map database rows to frontend types
const mapDbToSubscriptionPlan = (plan: Record<string, unknown>): SubscriptionPlan => ({
    id: plan.id as string,
    name: plan.name as string,
    description: plan.description as string,
    features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string),
    price: billingInterval === 'monthly' ? plan.monthly_price as number : plan.yearly_price as number,
    monthlyPrice: plan.monthly_price as number,
    yearlyPrice: plan.yearly_price as number,
    interval: billingInterval === 'monthly' ? 'month' : 'year',
    currency: (plan.currency as string) || "SEK", // Default to SEK
    isPopular: plan.is_popular as boolean,
    priority: plan.priority as number,
    metadata: plan.metadata as Record<string, unknown>
});

const mapDbToPaymentMethod = (pm: Record<string, unknown>): PaymentMethod => ({
    id: pm.id as string,
    userId: pm.user_id as string,
    type: pm.type as string,
    brand: pm.brand as string | undefined,
    lastFour: pm.last_four as string | undefined,
    last4: pm.last_four as string | undefined, // For compatibility
    expiryMonth: pm.expiry_month as number,
    expiryYear: pm.expiry_year as number,
    isDefault: pm.is_default as boolean,
    name: pm.name as string | undefined,
    createdAt: pm.created_at as string
});

const mapDbToInvoice = (invoice: Record<string, unknown>): Invoice => ({
    id: invoice.id as string,
    userId: invoice.user_id as string,
    subscriptionId: invoice.subscription_id as string | undefined,
    amount: invoice.amount as number,
    status: invoice.status as Invoice['status'],
    currency: (invoice.currency as string) || "SEK", // Default to SEK
    date: invoice.invoice_date as string,
    dueDate: invoice.due_date as string | undefined,
    description: invoice.description as string | undefined,
    pdf: invoice.pdf_url as string | undefined,
    hostedInvoiceUrl: invoice.hosted_invoice_url as string | undefined,
    createdAt: invoice.created_at as string
});

const mapDbToSubscription = async (sub: Record<string, unknown>): Promise<Subscription> => {
    // Update billing interval based on subscription
    billingInterval = (sub.billing_interval as 'monthly' | 'yearly') || 'monthly';
    
    // Fetch the plan details
    const { data: planData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', sub.plan_id)
        .single();

    return {
        id: sub.id as string,
        userId: sub.user_id as string,
        planId: sub.plan_id as string,
        status: sub.status as Subscription['status'],
        currentPeriodStart: sub.current_period_start as string,
        currentPeriodEnd: sub.current_period_end as string,
        cancelAtPeriodEnd: sub.cancel_at_period_end as boolean,
        billingInterval: sub.billing_interval as 'monthly' | 'yearly',
        trialEnd: sub.trial_end as string | undefined,
        pausedAt: sub.paused_at as string | undefined,
        resumesAt: sub.resumes_at as string | undefined,
        createdAt: sub.created_at as string,
        updatedAt: sub.updated_at as string,
        plan: planData ? mapDbToSubscriptionPlan(planData) : undefined
    };
};

// Subscription service
export const subscriptionService = {
    // Get subscription plans
    async getSubscriptionPlans(interval: 'monthly' | 'yearly' = 'monthly'): Promise<SubscriptionPlan[]> {
        try {
            // Update billing interval for proper price display
            billingInterval = interval;
            console.log(`Getting subscription plans with ${interval} billing interval`);
            
            // Fetch subscription plans from the database
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('priority', { ascending: true });
                
            if (error) {
                console.error('Error fetching subscription plans:', error);
                throw error;
            }
            
            // If no plans found in the database, return empty array
            if (!data || data.length === 0) {
                console.log('No subscription plans found in database, using fallback mock data');
                // Return fallback mock data only if no plans exist in the database
                return [
                    {
                        id: '1',
                        name: 'Basic',
                        description: 'Perfect for small restaurants just getting started',
                        features: [
                            'Up to 500 inventory items',
                            'Basic reporting',
                            '1 user account',
                            'Email support'
                        ],
                        price: interval === 'monthly' ? 150 : 1500,
                        monthlyPrice: 150,
                        yearlyPrice: 1500,
                        interval: interval === 'monthly' ? 'month' : 'year',
                        currency: 'SEK',
                        isPopular: false,
                        priority: 1,
                        metadata: {}
                    },
                    {
                        id: '2',
                        name: 'Professional',
                        description: 'Ideal for growing restaurants with more needs',
                        features: [
                            'Unlimited inventory items',
                            'Advanced reporting & analytics',
                            'Up to 5 user accounts',
                            'Priority email support',
                            'Menu planning tools',
                            'Supplier management'
                        ],
                        price: interval === 'monthly' ? 300 : 3000,
                        monthlyPrice: 300,
                        yearlyPrice: 3000,
                        interval: interval === 'monthly' ? 'month' : 'year',
                        currency: 'SEK',
                        isPopular: true,
                        priority: 2,
                        metadata: {}
                    },
                    {
                        id: '3',
                        name: 'Enterprise',
                        description: 'For restaurant chains and large operations',
                        features: [
                            'Everything in Professional',
                            'Unlimited user accounts',
                            'Multi-location support',
                            'API access',
                            'Dedicated account manager',
                            'Custom integrations',
                            '24/7 phone support'
                        ],
                        price: interval === 'monthly' ? 500 : 5000,
                        monthlyPrice: 500,
                        yearlyPrice: 5000,
                        interval: interval === 'monthly' ? 'month' : 'year',
                        currency: 'SEK',
                        isPopular: false,
                        priority: 3,
                        metadata: {}
                    }
                ];
            }
            
            console.log(`Found ${data.length} subscription plans in database`);
            
            // Map database records to SubscriptionPlan objects
            return data.map(plan => {
                const mappedPlan = mapDbToSubscriptionPlan(plan);
                // Ensure price is set based on the requested interval
                mappedPlan.price = interval === 'monthly' ? mappedPlan.monthlyPrice : mappedPlan.yearlyPrice;
                mappedPlan.interval = interval === 'monthly' ? 'month' : 'year';
                return mappedPlan;
            });
        } catch (error) {
            console.error('Error in getSubscriptionPlans:', error);
            throw error;
        }
    },

    // Get subscription for a user
    async getSubscription(userId: string): Promise<Subscription | null> {
        try {
            if (!userId) throw new Error('User ID is required');
            
            console.log(`Fetching subscription for user: ${userId}`);
            
            // First, get the business profile ID for this user
            const { data: profileData, error: profileError } = await supabase
                .from('business_profile_users')
                .select('business_profile_id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
                
            if (profileError) {
                console.error('Error fetching business profile:', profileError);
                if (profileError.code === 'PGRST116') {
                    console.log('No business profile found for user');
                    return null;
                }
                throw profileError;
            }
            
            if (!profileData || !profileData.business_profile_id) {
                console.log('No business profile ID found for user');
                return null;
            }
            
            const businessProfileId = profileData.business_profile_id;
            console.log(`Found business profile ID: ${businessProfileId}`);
            
            // Get subscription from the subscriptions table
            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('business_profile_id', businessProfileId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
                
            // Also get subscription info from the business_profiles table as a fallback
            const { data: profileSubscriptionData, error: profileSubscriptionError } = await supabase
                .from('business_profiles')
                .select('subscription_id, subscription_plan, subscription_status, subscription_current_period_end, subscription_price_id')
                .eq('id', businessProfileId)
                .single();
                
            if (subscriptionError && subscriptionError.code !== 'PGRST116') {
                console.error('Error fetching subscription:', subscriptionError);
            }
            
            if (profileSubscriptionError) {
                console.error('Error fetching profile subscription data:', profileSubscriptionError);
            }
            
            // If we have subscription data from the subscriptions table, use that
            if (subscriptionData) {
                console.log('Found subscription in subscriptions table:', subscriptionData.id);
                return await mapDbToSubscription(subscriptionData);
            }
            
            // If we have subscription data from the business_profiles table, use that as fallback
            if (profileSubscriptionData && profileSubscriptionData.subscription_id) {
                console.log('Found subscription in business_profiles table:', profileSubscriptionData.subscription_id);
                
                // Create a properly typed subscription object with all required fields
                const subscription: Subscription = {
                    id: profileSubscriptionData.subscription_id,
                    userId: userId,
                    planId: profileSubscriptionData.subscription_plan || '',
                    status: (profileSubscriptionData.subscription_status as Subscription['status']) || 'active',
                    currentPeriodStart: new Date().toISOString(),
                    currentPeriodEnd: profileSubscriptionData.subscription_current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    cancelAtPeriodEnd: false,
                    billingInterval: 'monthly',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                return subscription;
            }
            
            console.log('No subscription found for user');
            return null;
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw error;
        }
    },

    // Change subscription plan
    async changePlan(
        userId: string,
        planId: string,
        billingIntervalParam: "monthly" | "yearly" = "monthly"
    ): Promise<Subscription> {
        try {
            if (!userId) throw new Error('User ID is required');
            if (!planId) throw new Error('Plan ID is required');

            // Update billing interval for proper price display
            billingInterval = billingIntervalParam;
            
            // Get the plan details
            const { data: planData, error: planError } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('id', planId)
                .single();

            if (planError) throw planError;
            if (!planData) throw new Error('Plan not found');

            // Get current subscription
            const { data: currentSub, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // Calculate new period dates
            const now = new Date();
            const endDate = new Date();
            if (billingIntervalParam === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            if (subError && subError.code !== 'PGRST116') throw subError;

            let result;
            if (currentSub) {
                // Update existing subscription
                const { data, error } = await supabase
                    .from('subscriptions')
                    .update({
                        plan_id: planId,
                        billing_interval: billingIntervalParam,
                        current_period_start: now.toISOString(),
                        current_period_end: endDate.toISOString(),
                        cancel_at_period_end: false,
                        status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentSub.id)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            } else {
                // Create new subscription
                const { data, error } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        plan_id: planId,
                        billing_interval: billingIntervalParam,
                        current_period_start: now.toISOString(),
                        current_period_end: endDate.toISOString(),
                        status: 'active'
                    })
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            }

            return await mapDbToSubscription(result);
        } catch (error) {
            console.error('Error changing subscription plan:', error);
            throw error;
        }
    },

    // Cancel subscription
    async cancelSubscription(
        userId: string,
        cancelAtPeriodEnd: boolean = true
    ): Promise<Subscription> {
        try {
            if (!userId) throw new Error('User ID is required');

            // Get current subscription
            const { data: currentSub, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (subError) throw subError;
            if (!currentSub) throw new Error('No active subscription found');

            const updates: Record<string, unknown> = {
                cancel_at_period_end: cancelAtPeriodEnd,
                updated_at: new Date().toISOString()
            };

            // If immediate cancellation, update status
            if (!cancelAtPeriodEnd) {
                updates.status = 'canceled';
            }

            const { data, error } = await supabase
                .from('subscriptions')
                .update(updates)
                .eq('id', currentSub.id)
                .select()
                .single();

            if (error) throw error;
            return await mapDbToSubscription(data);
        } catch (error) {
            console.error('Error canceling subscription:', error);
            throw error;
        }
    },

    // Get payment methods for a user
    async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
        try {
            if (!userId) throw new Error('User ID is required');

            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapDbToPaymentMethod);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    },

    // Add a payment method
    async addPaymentMethod(
        userId: string,
        paymentMethodData: Omit<PaymentMethod, "id" | "userId" | "createdAt">
    ): Promise<PaymentMethod> {
        try {
            if (!userId) throw new Error('User ID is required');

            // Check if this is the first payment method
            const { count, error: countError } = await supabase
                .from('payment_methods')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (countError) throw countError;

            // If this is the first payment method, make it default
            const isDefault = (count === 0 || count === null) || paymentMethodData.isDefault;

            // If this is set as default, unset other defaults
            if (isDefault && count && count > 0) {
                const { error: updateError } = await supabase
                    .from('payment_methods')
                    .update({ is_default: false })
                    .eq('user_id', userId)
                    .eq('is_default', true);

                if (updateError) throw updateError;
            }

            // Insert the new payment method
            const { data, error } = await supabase
                .from('payment_methods')
                .insert({
                    user_id: userId,
                    type: paymentMethodData.type,
                    brand: paymentMethodData.brand,
                    last_four: paymentMethodData.lastFour || paymentMethodData.last4,
                    expiry_month: paymentMethodData.expiryMonth,
                    expiry_year: paymentMethodData.expiryYear,
                    is_default: isDefault,
                    name: paymentMethodData.name
                })
                .select()
                .single();

            if (error) throw error;
            return mapDbToPaymentMethod(data);
        } catch (error) {
            console.error('Error adding payment method:', error);
            throw error;
        }
    },

    // Update a payment method
    async updatePaymentMethod(
        paymentMethodId: string,
        updates: Partial<PaymentMethod>
    ): Promise<PaymentMethod> {
        try {
            if (!paymentMethodId) throw new Error('Payment method ID is required');

            // Get the payment method to check user_id
            const { data: existingPM, error: getError } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('id', paymentMethodId)
                .single();

            if (getError) throw getError;
            if (!existingPM) throw new Error('Payment method not found');

            // If setting as default, unset other defaults
            if (updates.isDefault) {
                const { error: updateError } = await supabase
                    .from('payment_methods')
                    .update({ is_default: false })
                    .eq('user_id', existingPM.user_id)
                    .eq('is_default', true)
                    .neq('id', paymentMethodId);

                if (updateError) throw updateError;
            }

            // Map frontend fields to database fields
            const dbUpdates: Record<string, unknown> = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.expiryMonth !== undefined) dbUpdates.expiry_month = updates.expiryMonth;
            if (updates.expiryYear !== undefined) dbUpdates.expiry_year = updates.expiryYear;
            if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

            // Update the payment method
            const { data, error } = await supabase
                .from('payment_methods')
                .update(dbUpdates)
                .eq('id', paymentMethodId)
                .select()
                .single();

            if (error) throw error;
            return mapDbToPaymentMethod(data);
        } catch (error) {
            console.error('Error updating payment method:', error);
            throw error;
        }
    },

    // Delete a payment method
    async deletePaymentMethod(paymentMethodId: string): Promise<void> {
        try {
            if (!paymentMethodId) throw new Error('Payment method ID is required');

            // Get the payment method to check if it\'s default
            const { data: existingPM, error: getError } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('id', paymentMethodId)
                .single();

            if (getError) throw getError;
            if (!existingPM) throw new Error('Payment method not found');

            // Delete the payment method
            const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', paymentMethodId);

            if (error) throw error;

            // If this was the default payment method, set another one as default if available
            if (existingPM.is_default) {
                const { data: otherPMs, error: listError } = await supabase
                    .from('payment_methods')
                    .select('*')
                    .eq('user_id', existingPM.user_id)
                    .limit(1);

                if (listError) throw listError;

                if (otherPMs && otherPMs.length > 0) {
                    const { error: updateError } = await supabase
                        .from('payment_methods')
                        .update({ is_default: true })
                        .eq('id', otherPMs[0].id);

                    if (updateError) throw updateError;
                }
            }
        } catch (error) {
            console.error('Error deleting payment method:', error);
            throw error;
        }
    },

    // Get invoices for a user
    async getInvoices(userId: string): Promise<Invoice[]> {
        try {
            if (!userId) throw new Error('User ID is required');

            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .order('invoice_date', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapDbToInvoice);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    },

    // Get a specific invoice
    async getInvoice(invoiceId: string): Promise<Invoice> {
        try {
            if (!invoiceId) throw new Error('Invoice ID is required');

            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', invoiceId)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Invoice not found');

            // Get invoice items
            const { data: items, error: itemsError } = await supabase
                .from('invoice_items')
                .select('*')
                .eq('invoice_id', invoiceId);

            if (itemsError) throw itemsError;

            const invoice = mapDbToInvoice(data);
            invoice.items = items?.map(item => ({
                id: item.id,
                invoiceId: item.invoice_id,
                description: item.description,
                amount: item.amount,
                quantity: item.quantity
            })) as InvoiceItem[] || [];

            return invoice;
        } catch (error) {
            console.error('Error fetching invoice:', error);
            throw error;
        }
    }
};