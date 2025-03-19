import { supabase, handleAuthError } from '@/lib/supabase';
import { getUserProfile, createUserProfile, updateEmailConfirmedStatus } from '@/lib/services/user-profile-service';
import { checkBusinessProfileAccess } from '@/lib/services/business-profile-user-service';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useBusinessProfileUserStore } from '@/lib/stores/business-profile-user-store';
import { type User, type Session } from '@supabase/supabase-js';

/**
 * Complete sign up flow with email confirmation
 * @param email User's email
 * @param password User's password
 * @param name Optional user's name
 * @returns Sign up result with email verification status
 */
export async function signUp(
    email: string,
    password: string,
    name?: string
): Promise<{
    user: User | null;
    session: Session | null;
    needsEmailVerification: boolean;
}> {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name || email.split('@')[0],
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
            },
        });

        if (error) throw error;

        // Create user profile immediately after sign up
        if (data.user) {
            try {
                await createUserProfile(
                    data.user.id,
                    email,
                    data.user.user_metadata?.name || name
                );
            } catch (profileError) {
                console.error('Error creating user profile during signup:', profileError);
                // Continue with sign-up flow - non-fatal error
            }
        }

        // If session is null or email isn't confirmed, user needs to verify email
        const needsEmailVerification = !data.session || !data.user?.email_confirmed_at;

        return {
            user: data.user,
            session: data.session,
            needsEmailVerification,
        };
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
}

/**
 * Sign in with email and password
 * @param email User's email
 * @param password User's password
 * @returns Sign in result with profile and business profile status
 */
export async function signIn(
    email: string,
    password: string
): Promise<{
    user: User | null;
    session: Session | null;
    isEmailVerified: boolean;
    hasProfile: boolean;
    hasBusinessProfile: boolean;
}> {
    try {
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Get email verification status
        const isEmailVerified = !!data.user?.email_confirmed_at;

        // Check user profile
        let hasProfile = false;
        try {
            const profile = await getUserProfile(data.user.id);
            hasProfile = !!profile;

            // If email is verified but profile doesn't show it, update profile
            if (isEmailVerified && profile && !profile.email_confirmed) {
                await updateEmailConfirmedStatus(data.user.id, true);
            }

            // If profile doesn't exist, create it
            if (!profile) {
                await createUserProfile(
                    data.user.id,
                    data.user.email as string,
                    data.user.user_metadata?.name
                );
                hasProfile = true;
            }
        } catch (profileError) {
            console.error('Error checking user profile during signin:', profileError);
            // Non-fatal error, continue with signin flow
        }

        // Check business profile
        let hasBusinessProfile = false;
        try {
            const { hasAccess } = await checkBusinessProfileAccess(data.user.id);
            hasBusinessProfile = hasAccess;
        } catch (businessProfileError) {
            console.error('Error checking business profile during signin:', businessProfileError);
            // Non-fatal error, continue with signin flow
        }

        // Update auth store and business profile store
        const authStore = useAuthStore.getState();
        authStore.setIsEmailVerified(isEmailVerified);

        // Return complete authentication state
        return {
            user: data.user,
            session: data.session,
            isEmailVerified,
            hasProfile,
            hasBusinessProfile,
        };
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
}

/**
 * Handle auth callback (verification, password reset, etc.)
 * @param url Complete callback URL with parameters
 * @returns Auth callback result with verification status
 */
export async function handleAuthCallback(url: string): Promise<{
    user: User | null;
    session: Session | null;
    isEmailVerified: boolean;
    hasBusinessProfile: boolean;
}> {
    try {
        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);

        if (error) throw error;

        // Get email verification status
        const isEmailVerified = !!data.user?.email_confirmed_at;

        // Sync email verification status with profile
        if (isEmailVerified) {
            try {
                await updateEmailConfirmedStatus(data.user.id, true);
            } catch (profileError) {
                console.error('Error updating profile email status:', profileError);
                // Non-fatal error, continue
            }
        }

        // Check business profile
        let hasBusinessProfile = false;
        try {
            const { hasAccess } = await checkBusinessProfileAccess(data.user.id);
            hasBusinessProfile = hasAccess;
        } catch (businessProfileError) {
            console.error('Error checking business profile during callback:', businessProfileError);
            // Non-fatal error, continue
        }

        // Update auth store
        const authStore = useAuthStore.getState();
        authStore.setIsEmailVerified(isEmailVerified);

        // Update business profile store
        try {
            const businessProfileStore = useBusinessProfileUserStore.getState();
            await businessProfileStore.checkAccess(data.user.id);
        } catch (storeError) {
            console.error('Error updating business profile store:', storeError);
            // Non-fatal error, continue
        }

        return {
            user: data.user,
            session: data.session,
            isEmailVerified,
            hasBusinessProfile,
        };
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
}

/**
 * Reset password request
 * @param email User's email
 * @returns Success status
 */
export async function resetPassword(email: string): Promise<boolean> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

        if (error) throw error;
        return true;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
}

/**
 * Sign out the current user
 * @returns Success status
 */
export async function signOut(): Promise<boolean> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
}

/**
 * Integrated auth service providing all authentication-related functions
 */
export const authService = {
    signUp,
    signIn,
    handleAuthCallback,
    resetPassword,
    signOut,
};
