import { supabase } from '@/lib/supabase';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = {
    id: null as string | null,
    userId: null as string | null,
    timestamp: 0,
    promise: null as Promise<string | null> | null
};

// Debounce configuration
let pendingPromise: Promise<string | null> | null = null;
const DEBOUNCE_DELAY = 100; // 100ms

/**
 * Get the business profile ID for the current user
 * This is a unified service that handles caching and debouncing
 */
export async function getBusinessProfileId(): Promise<string | null> {
    try {
        // Check if we have a valid cached value
        const now = Date.now();
        if (cache.id && cache.timestamp > now - CACHE_DURATION) {
            console.log('Using cached business profile ID:', cache.id);
            return cache.id;
        }

        // If there's a pending promise, return it
        if (pendingPromise) {
            console.log('Using pending business profile ID request');
            return pendingPromise;
        }

        // Create a new promise for fetching the profile ID
        pendingPromise = (async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.error('No authenticated user found');
                    return null;
                }

                // First try to get from business_profile_users table
                const { data: businessProfileData, error: profileError } = await supabase
                    .from('business_profile_users')
                    .select('business_profile_id')
                    .eq('user_id', user.id)
                    .single();

                if (!profileError && businessProfileData) {
                    // Update cache
                    cache = {
                        id: businessProfileData.business_profile_id,
                        userId: user.id,
                        timestamp: now,
                        promise: null
                    };
                    return cache.id;
                }

                // If that fails, try direct query to business_profiles
                const { data: businessProfiles, error: profilesError } = await supabase
                    .from('business_profiles')
                    .select('id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (!profilesError && businessProfiles && businessProfiles.length > 0) {
                    // Update cache
                    cache = {
                        id: businessProfiles[0].id,
                        userId: user.id,
                        timestamp: now,
                        promise: null
                    };
                    return cache.id;
                }

                console.warn('No business profile found for user');
                return null;
            } finally {
                // Clear the pending promise after a short delay
                setTimeout(() => {
                    pendingPromise = null;
                }, DEBOUNCE_DELAY);
            }
        })();

        return pendingPromise;
    } catch (error) {
        console.error('Error in getBusinessProfileId:', error);
        return null;
    }
}

// Export a function to clear the cache if needed
export function clearBusinessProfileIdCache() {
    cache = {
        id: null,
        userId: null,
        timestamp: 0,
        promise: null
    };
    pendingPromise = null;
} 