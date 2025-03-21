import { supabase } from "@/lib/supabase";

// Enhanced cache for business profile data
let businessProfileCache: {
    id: string;
    userId: string;
    currency: string;
    name: string;
    timestamp: number;
} | null = null;

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 800;

/**
 * Get the current user's business profile ID
 * This is a core function used by many dashboard services
 */
export async function getBusinessProfileId(): Promise<string | null> {
    try {
        // Get the current user
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

        // Try to get the business profile with retries
        try {
            return await fetchBusinessProfileWithRetry(user.id);
        } catch (error) {
            console.error('All retries failed in getBusinessProfileId:', error);
            
            // Return cached ID if available, even if expired
            if (businessProfileCache && businessProfileCache.userId === user.id) {
                console.log('Returning stale cached business profile ID after error');
                return businessProfileCache.id;
            }
            
            return null;
        }
    } catch (error) {
        console.error('Error in getBusinessProfileId:', error);
        
        // Return cached ID if available, even if expired
        if (businessProfileCache) {
            console.log('Returning stale cached business profile ID after error');
            return businessProfileCache.id;
        }
        
        return null;
    }
}

/**
 * Fetch business profile with retry logic
 */
async function fetchBusinessProfileWithRetry(userId: string, retryCount = 0): Promise<string | null> {
    try {
        // Query to get the business profile associated with this user
        const { data: businessProfileData, error: businessProfileError } = await supabase
            .from('business_profile_users')
            .select('business_profile_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (businessProfileError) {
            console.error(`Error fetching business profile: ${businessProfileError.message}`);
            
            // Retry logic
            if (retryCount < MAX_RETRIES) {
                const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
                console.log(`Retrying business profile fetch in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchBusinessProfileWithRetry(userId, retryCount + 1);
            }
            
            throw businessProfileError;
        }

        // If no data found, check if there's a business profile directly owned by this user
        if (!businessProfileData) {
            console.log('No business profile association found, checking direct ownership');
            
            const { data: directBusinessProfile, error: directProfileError } = await supabase
                .from('business_profiles')
                .select('id, default_currency, name')
                .eq('user_id', userId)
                .maybeSingle();
                
            if (directProfileError) {
                console.error(`Error fetching direct business profile: ${directProfileError.message}`);
                return null;
            }
            
            if (directBusinessProfile) {
                console.log('Found direct business profile:', directBusinessProfile.id);
                
                // Update cache
                businessProfileCache = {
                    id: directBusinessProfile.id,
                    userId: userId,
                    currency: directBusinessProfile.default_currency || 'USD',
                    name: directBusinessProfile.name || 'My Business',
                    timestamp: Date.now()
                };
                
                return directBusinessProfile.id;
            }
            
            console.log('No business profile found for user');
            return null;
        }
        
        // We found a business profile association, get the full business profile
        const businessProfileId = businessProfileData.business_profile_id;
        console.log('Found business profile association:', businessProfileId);
        
        // Get the business profile details
        const { data: profileDetails, error: profileDetailsError } = await supabase
            .from('business_profiles')
            .select('id, default_currency, name')
            .eq('id', businessProfileId)
            .single();
            
        if (profileDetailsError) {
            console.error(`Error fetching business profile details: ${profileDetailsError.message}`);
            return businessProfileId; // Still return the ID even if we couldn't get details
        }
        
        // Update cache with the full details
        businessProfileCache = {
            id: businessProfileId,
            userId: userId,
            currency: profileDetails.default_currency || 'USD',
            name: profileDetails.name || 'My Business',
            timestamp: Date.now()
        };
        
        return businessProfileId;
    } catch (error) {
        console.error(`Error in fetchBusinessProfileWithRetry: ${error}`);
        throw error;
    }
}

/**
 * Get the currency for a specific business profile
 */
export async function getBusinessProfileCurrencyById(profileId: string): Promise<string> {
    try {
        // Check if we have it in cache first
        if (businessProfileCache && businessProfileCache.id === profileId) {
            return businessProfileCache.currency;
        }

        // Fetch from database
        const { data, error } = await supabase
            .from('business_profiles')
            .select('default_currency')
            .eq('id', profileId)
            .single();

        if (error) {
            console.error('Error fetching business profile currency:', error);
            return 'USD'; // Default fallback
        }

        return data.default_currency || 'USD';
    } catch (error) {
        console.error('Error in getBusinessProfileCurrencyById:', error);
        return 'USD'; // Default fallback
    }
}

/**
 * Get the name for a specific business profile
 */
export async function getBusinessProfileNameById(profileId: string): Promise<string> {
    try {
        // Check if we have it in cache first
        if (businessProfileCache && businessProfileCache.id === profileId) {
            return businessProfileCache.name;
        }

        // Fetch from database
        const { data, error } = await supabase
            .from('business_profiles')
            .select('name')
            .eq('id', profileId)
            .single();

        if (error) {
            console.error('Error fetching business profile name:', error);
            return 'My Business'; // Default fallback
        }

        return data.name || 'My Business';
    } catch (error) {
        console.error('Error in getBusinessProfileNameById:', error);
        return 'My Business'; // Default fallback
    }
}

/**
 * Get the current user's business profile currency
 */
export async function getBusinessProfileCurrency(): Promise<string> {
    try {
        const profileId = await getBusinessProfileId();
        
        if (!profileId) {
            return 'USD'; // Default fallback
        }
        
        return getBusinessProfileCurrencyById(profileId);
    } catch (error) {
        console.error('Error in getBusinessProfileCurrency:', error);
        return 'USD'; // Default fallback
    }
}

/**
 * Get the current user's business profile name
 */
export async function getBusinessProfileName(): Promise<string> {
    try {
        const profileId = await getBusinessProfileId();
        
        if (!profileId) {
            return 'My Business'; // Default fallback
        }
        
        return getBusinessProfileNameById(profileId);
    } catch (error) {
        console.error('Error in getBusinessProfileName:', error);
        return 'My Business'; // Default fallback
    }
}