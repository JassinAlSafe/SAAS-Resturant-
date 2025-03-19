import { supabase } from "@/lib/supabase";

/**
 * Check if a user profile exists
 * @param userId The user ID to check
 * @returns true if profile exists, false otherwise
 */
export async function checkUserProfileExists(userId: string): Promise<boolean> {
    try {
        // Check if a profile exists for this user
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // PGRST116 means the row wasn't found
                return false;
            }
            console.error('Error checking user profile:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Error in checkUserProfileExists:', error);
        return false;
    }
}

/**
 * Create a user profile
 * @param userId The user ID
 * @param email The user email
 * @param name The user name (optional)
 */
export async function createUserProfile(
    userId: string,
    email: string,
    name?: string
): Promise<boolean> {
    try {
        const { error } = await supabase.from('profiles').upsert([
            {
                id: userId,
                email,
                name: name || email.split('@')[0],
                role: 'user',
                email_confirmed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ]);

        if (error) {
            console.error('Error creating user profile:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in createUserProfile:', error);
        return false;
    }
}
