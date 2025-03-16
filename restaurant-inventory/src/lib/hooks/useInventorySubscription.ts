import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useNotificationHelpers } from '@/lib/notification-context';

interface UseInventorySubscriptionProps {
    onItemsChanged?: (items: InventoryItem[]) => void;
    initialItems?: InventoryItem[];
}

interface UseInventorySubscriptionResult {
    subscriptionError: string | null;
    isSubscriptionLoading: boolean;
    isSubscribed: boolean;
    retrySubscription: () => void;
}

/**
 * Custom hook for handling real-time inventory subscription
 * with improved loading state and retry mechanism
 */
export function useInventorySubscription({
    onItemsChanged,
    initialItems = []
}: UseInventorySubscriptionProps = {}): UseInventorySubscriptionResult {
    // Subscription state
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    // Notifications
    const { error: showError } = useNotificationHelpers();

    // Set up subscription to inventory changes
    const setupSubscription = useCallback(async () => {
        setIsSubscriptionLoading(true);
        setSubscriptionError(null);

        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Get the user's business profile
            const { data: businessProfile, error: businessError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !businessProfile) {
                throw new Error('Business profile not found');
            }

            // Subscribe to changes in the ingredients table
            const subscription = supabase
                .channel('ingredients-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'ingredients',
                    filter: `business_profile_id=eq.${businessProfile.id}`
                }, async (payload) => {
                    // When a change occurs, fetch the updated inventory items
                    try {
                        const { data, error } = await supabase
                            .from('ingredients')
                            .select('*, suppliers(*)')
                            .eq('business_profile_id', businessProfile.id)
                            .order('name');

                        if (error) {
                            console.error('Error fetching updated inventory data:', error);
                            return;
                        }

                        // Transform the data and notify via callback
                        if (data && onItemsChanged) {
                            const transformedData = data.map((item: any) => ({
                                id: item.id,
                                name: item.name,
                                category: item.category,
                                quantity: item.quantity,
                                unit: item.unit,
                                reorderLevel: item.reorder_level,
                                cost_per_unit: item.cost,
                                minimum_stock_level: item.minimum_stock_level,
                                reorder_point: item.reorder_point,
                                supplier_id: item.supplier_id,
                                location: item.location,
                                expiryDate: item.expiry_date || undefined,
                                supplierId: item.supplier_id || undefined,
                                created_at: item.created_at,
                                updated_at: item.updated_at
                            }));
                            onItemsChanged(transformedData);
                        }
                    } catch (error) {
                        console.error('Error processing subscription update:', error);
                    }
                })
                .subscribe();

            // Successfully subscribed
            setIsSubscribed(true);
            setRetryCount(0);

            // Cleanup function to unsubscribe when component unmounts
            return () => {
                subscription.unsubscribe();
                setIsSubscribed(false);
            };
        } catch (error) {
            // Handle subscription error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error subscribing to inventory changes';
            setSubscriptionError(errorMessage);
            console.error('Error setting up inventory subscription:', error);

            // Show error notification only on the first attempt
            if (retryCount === 0) {
                showError(
                    'Subscription Error',
                    'Failed to subscribe to inventory updates. Some changes may not appear automatically.'
                );
            }

            // Return a no-op function instead of undefined
            return () => {
                console.log('No subscription to clean up');
            };
        } finally {
            setIsSubscriptionLoading(false);
        }
    }, [onItemsChanged, retryCount, showError]);

    // Retry subscription
    const retrySubscription = useCallback(() => {
        if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setupSubscription();
        } else {
            setSubscriptionError('Maximum retry attempts reached. Please refresh the page.');
        }
    }, [retryCount, setupSubscription]);

    // Set up subscription on mount and retry if needed
    useEffect(() => {
        let cleanupFn: (() => void) | undefined;

        // Use Promise to handle the async setupSubscription
        setupSubscription()
            .then(cleanup => {
                cleanupFn = cleanup;
            })
            .catch(err => {
                console.error('Error in subscription setup:', err);
            });

        // Return cleanup function
        return () => {
            if (typeof cleanupFn === 'function') {
                cleanupFn();
            }
        };
    }, [setupSubscription]);

    return {
        subscriptionError,
        isSubscriptionLoading,
        isSubscribed,
        retrySubscription
    };
} 