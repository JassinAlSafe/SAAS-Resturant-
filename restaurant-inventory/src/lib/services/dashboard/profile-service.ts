import { supabase } from "@/lib/supabase";

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
        const { data: profile, error: profileError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching business profile:', profileError);
            return null;
        }

        if (!profile) {
            console.log('No business profile found for user');
            return null;
        }

        console.log('Using business profile ID:', profile.id);
        return profile.id;
    } catch (error) {
        console.error('Exception in getBusinessProfileId:', error);
        return null;
    }
} 