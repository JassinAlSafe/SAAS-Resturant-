import { supabase } from "@/lib/supabase";
import { businessProfileService } from "@/lib/services/business-profile-service";

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

        // If we found profiles, schedule a cleanup of duplicates
        if (profiles.length > 0) {
            // Schedule cleanup to run after this operation
            setTimeout(() => businessProfileService.cleanupDuplicateProfiles(user.id), 1000);
        }

        console.log('Using business profile ID:', profile.id);
        return profile.id;
    } catch (error) {
        console.error('Exception in getBusinessProfileId:', error);
        return null;
    }
} 