import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    email_confirmed: boolean;
    created_at: string;
    updated_at: string;
}

export class UserProfileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserProfileError';
    }
}

/**
 * Lightweight check for user profile existence
 */
export async function checkUserProfileExists(userId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw new UserProfileError(`Failed to check profile: ${error.message}`);
        return !!data;
    } catch (error) {
        console.error('Error checking user profile:', error);
        return false;
    }
}

/**
 * Fetch the complete user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw new UserProfileError(`Failed to fetch profile: ${error.message}`);
        return data as UserProfile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Create a new user profile
 */
export async function createUserProfile(
    userId: string,
    email: string,
    name?: string
): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email,
                name: name || null,
                email_confirmed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new UserProfileError(`Failed to create profile: ${error.message}`);
        return data as UserProfile;
    } catch (error) {
        console.error('Error creating user profile:', error);
        return null;
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new UserProfileError(`Failed to update profile: ${error.message}`);
        return data as UserProfile;
    } catch (error) {
        console.error('Error updating user profile:', error);
        return null;
    }
}

/**
 * Update email confirmed status
 */
export async function updateEmailConfirmedStatus(
    userId: string,
    isConfirmed: boolean
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                email_confirmed: isConfirmed,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw new UserProfileError(`Failed to update email confirmation: ${error.message}`);
        return true;
    } catch (error) {
        console.error('Error updating email confirmation:', error);
        return false;
    }
} 