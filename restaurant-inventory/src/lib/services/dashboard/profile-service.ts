import { supabase } from "@/lib/supabase";
import { businessProfileService } from "@/lib/services/business-profile-service";

// Add caching to reduce duplicate fetches
const CACHE_DURATION = 30000; // 30 seconds
const profileCache = {
    id: null as string | null,
    timestamp: 0,
    userId: null as string | null
};

/**
 * Get the current user's business profile ID
 * This is a core function used by many dashboard services
 */
export async function getBusinessProfileId(): Promise<string | null> {
    try {
        // Always use getUser() instead of getSession() for security
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Error getting user:', userError);
            return null;
        }

        if (!user) {
            console.log('No authenticated user found');
            return null;
        }

        // Check if we have a valid cached value for this user
        const now = Date.now();
        if (
            profileCache.id &&
            profileCache.userId === user.id &&
            now - profileCache.timestamp < CACHE_DURATION
        ) {
            console.log('Using cached business profile ID:', profileCache.id);
            return profileCache.id;
        }

        console.log('Fetching business profile for user ID:', user.id);
        const { data: profiles, error: profileError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (profileError) {
            console.error('Error fetching business profile:', profileError);
            return null;
        }

        if (!profiles || profiles.length === 0) {
            console.log('No business profile found for user');
            return null;
        }

        // Get the most recent profile
        const profile = profiles[0];

        // Update cache
        profileCache.id = profile.id;
        profileCache.timestamp = now;
        profileCache.userId = user.id;

        // If we found multiple profiles, schedule a cleanup
        if (profiles.length > 1) {
            setTimeout(() => businessProfileService.cleanupDuplicateProfiles(user.id), 1000);
        }

        console.log('Using business profile ID:', profile.id);
        return profile.id;
    } catch (error) {
        console.error('Exception in getBusinessProfileId:', error);
        return null;
    }
} 