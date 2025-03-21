"use client";

import { getLogoutClient } from "@/lib/supabase";

export const authService = {
  /**
   * Comprehensive logout function that ensures all session data is cleared
   * This should be the single source of truth for logout functionality
   */
  logout: async (): Promise<void> => {
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
      const logoutClient = getLogoutClient();

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
};
