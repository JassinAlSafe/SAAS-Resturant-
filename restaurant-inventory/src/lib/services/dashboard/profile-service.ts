import { supabase } from "@/lib/supabase";

// Enhanced cache for business profile data
let businessProfileCache: {
    id: string;
    userId: string;
    currency: string;
    timestamp: number;
} | null = null;

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get the current user's business profile ID
 * This is a core function used by many dashboard services
 */
export async function getBusinessProfileId(): Promise<string | null> {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Error getting user:', userError);
            return null;
        }

        if (!user) {
            console.log('No authenticated user found');
            return null;
        }

        // Check if we have a valid cached profile ID for this user
        if (
            businessProfileCache &&
            businessProfileCache.userId === user.id &&
            Date.now() - businessProfileCache.timestamp < CACHE_TTL
        ) {
            console.log('Using cached business profile ID:', businessProfileCache.id);
            return businessProfileCache.id;
        }

        console.log('Fetching business profile for user ID:', user.id);

        // Query to get the business profile associated with this user
        const { data: businessProfileData, error: businessProfileError } = await supabase
            .from('business_profile_users')
            .select('business_profile_id')
            .eq('user_id', user.id)
            .single();

        if (businessProfileError) {
            console.error('Error fetching business profile:', businessProfileError);
            return null;
        }

        if (!businessProfileData) {
            console.log('No business profile found for user');
            return null;
        }

        const businessProfileId = businessProfileData.business_profile_id;

        // Update the cache
        businessProfileCache = {
            id: businessProfileId,
            userId: user.id,
            currency: 'USD', // Default currency, will be updated below
            timestamp: Date.now()
        };

        // Fetch additional profile details including currency
        const { data: profileDetails, error: profileDetailsError } = await supabase
            .from('business_profiles')
            .select('default_currency')
            .eq('id', businessProfileId)
            .single();

        if (!profileDetailsError && profileDetails) {
            // Update the currency in the cache
            businessProfileCache.currency = profileDetails.default_currency || 'USD';
            console.log(`Business profile currency: ${businessProfileCache.currency}`);
        }

        return businessProfileId;
    } catch (error) {
        console.error('Unexpected error in getBusinessProfileId:', error);
        return null;
    }
}

/**
 * Get the current user's business profile currency
 */
export async function getBusinessProfileCurrency(): Promise<string> {
    try {
        // First ensure the profile cache is populated
        await getBusinessProfileId();
        
        // Return the cached currency or default to USD
        return businessProfileCache?.currency || 'USD';
    } catch (error) {
        console.error('Error getting business profile currency:', error);
        return 'USD'; // Default to USD if there's an error
    }
}