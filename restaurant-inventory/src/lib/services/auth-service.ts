"use client";

import { createClient, createLogoutClient } from "@/lib/supabase/browser-client";
import { createVerificationClient } from "@/lib/supabase/verification-client";

/**
 * User metadata interface
 */
export interface UserMetadata {
  name?: string;
  role?: string;
  signup_completed?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Profile data interface
 */
export interface ProfileData {
  name?: string;
  email?: string;
  role?: string;
  last_sign_in?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Standard client for most operations
const supabase = createClient();

// Specialized client for auth verification flows
const verificationClient = createVerificationClient();

/**
 * Sign in with email and password
 */
async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred during sign in";
    return { success: false, error: errorMessage };
  }
}

/**
 * Sign up with email and password - using verification client
 */
async function signUp(
  email: string,
  password: string,
  metadata: UserMetadata = {}
) {
  try {
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.append("type", "signup");

    // Use verification client for signup
    const { data, error } = await verificationClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectUrl.toString(),
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const requiresEmailConfirmation = !data.session;

    return {
      success: true,
      requiresEmailConfirmation,
      user: data.user
    };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred during sign up";
    return { success: false, error: errorMessage };
  }
}

/**
 * Basic sign out - for most components
 */
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred during sign out";
    return { success: false, error: errorMessage };
  }
}

/**
 * Comprehensive logout function that ensures all session data is cleared
 * This should be the single source of truth for logout functionality
 */
async function logout(): Promise<void> {
  try {
    // Only run this code in browser environment
    if (typeof window === 'undefined') {
      console.warn('Logout called in server context, skipping client-side operations');
      return;
    }

    // 1. Clear localStorage
    const localStorageKeys = [
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'supabase.auth.expires_at',
      'supabase.auth.data',
      'supabase-auth-token'
    ];

    localStorageKeys.forEach(key => localStorage.removeItem(key));

    // 2. Clear sessionStorage
    const sessionStorageKeys = [
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'supabase.auth.expires_at',
      'supabase.auth.data',
      'supabase-auth-token'
    ];

    sessionStorageKeys.forEach(key => sessionStorage.removeItem(key));

    // 3. Clear all cookies that might contain auth data
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'sb-provider-token',
      'sb-auth-token',
      '__session',
      'is-authenticated'
    ];

    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; secure; sameSite=Lax`;
      // Also try clearing without secure and sameSite for older browsers
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
    });

    // 4. Set cookies to indicate logout in progress and prevent redirect loops
    document.cookie = "logout-in-progress=true; path=/; max-age=60; secure; sameSite=Lax";
    document.cookie = "just-logged-out=true; path=/; max-age=30; secure; sameSite=Lax";

    // 5. Get a non-persistent Supabase client for logout
    const logoutClient = createLogoutClient();

    // 6. Sign out from Supabase with global scope to clear all devices
    await logoutClient.auth.signOut({ scope: 'global' });

    // 7. Force browser to reload and clear any in-memory state
    window.location.href = `/login?logout=success&t=${Date.now()}`;
  } catch (error) {
    console.error("Error during logout:", error);

    // Even if there's an error, try to redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = `/login?error=logout_failed&t=${Date.now()}`;
    }
  }
}

/**
 * Reset password - using verification client
 */
async function resetPassword(email: string) {
  try {
    // Use verification client for password reset
    const { error } = await verificationClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred during password reset";
    return { success: false, error: errorMessage };
  }
}

/**
 * Update password - using verification client
 */
async function updatePassword(newPassword: string) {
  try {
    // Use verification client for password updates
    const { error } = await verificationClient.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred updating password";
    return { success: false, error: errorMessage };
  }
}

/**
 * Verify current password - using verification client
 */
async function verifyPassword(email: string, password: string) {
  try {
    // Use verification client for password verification
    const { error } = await verificationClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred verifying password";
    return { success: false, error: errorMessage };
  }
}

/**
 * Get current user
 */
async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred getting current user";
    return { user: null, error: errorMessage };
  }
}

/**
 * Get current session
 */
async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session: data.session, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred getting current session";
    return { session: null, error: errorMessage };
  }
}

/**
 * Update user profile
 */
async function updateUserProfile(
  userId: string,
  profileData: ProfileData
) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An error occurred updating profile";
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if user has a specific role
 */
async function hasRole(userId: string, roles: string[]) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    return roles.includes(data.role);
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
}

// Export all functions as part of an authService object
export const authService = {
  signIn,
  signUp,
  signOut,
  logout,
  resetPassword,
  updatePassword,
  verifyPassword,
  getCurrentUser,
  getCurrentSession,
  updateUserProfile,
  hasRole
};

// Also keep individual exports for backward compatibility
export {
  signIn,
  signUp,
  signOut,
  logout,
  resetPassword,
  updatePassword,
  verifyPassword,
  getCurrentUser,
  getCurrentSession,
  updateUserProfile,
  hasRole
};