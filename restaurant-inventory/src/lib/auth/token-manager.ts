import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

// Constants for error handling
const AUTH_ERROR_CODES = {
    REFRESH_TOKEN_NOT_FOUND: 'Refresh Token Not Found',
    INVALID_REFRESH_TOKEN: 'Invalid Refresh Token',
    TOKEN_EXPIRED: 'Token expired'
} as const;

/**
 * Check if the error is a refresh token error
 */
export function isRefreshTokenError(error: unknown): boolean {
    if (!error) return false;

    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
        errorMessage.includes(AUTH_ERROR_CODES.REFRESH_TOKEN_NOT_FOUND) ||
        errorMessage.includes(AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN) ||
        errorMessage.includes(AUTH_ERROR_CODES.TOKEN_EXPIRED)
    );
}

/**
 * Handle refresh token errors by clearing auth state and redirecting to login
 */
export async function handleRefreshTokenError(error: unknown): Promise<boolean> {
    if (!isRefreshTokenError(error)) return false;

    try {
        // Store the current path for redirect after login
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname + window.location.search;
            if (!currentPath.startsWith('/login')) {
                sessionStorage.setItem('auth_redirect', currentPath);
            }
        }

        // Sign out and clear auth state
        await supabase.auth.signOut();

        // Only redirect if we're not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = `/login?error=session_expired`;
        }

        return true;
    } catch (err) {
        console.error('Error handling refresh token error:', err);
        return false;
    }
}

/**
 * Check if the current session is valid and refresh if needed
 */
export async function checkAndRefreshSession(): Promise<Session | null> {
    try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();

        // If no session, return null
        if (!session) {
            return null;
        }

        // Check if session needs refresh (within 5 minutes of expiry)
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

        if (expiresAt && expiresAt - now < REFRESH_THRESHOLD) {
            console.log('Session needs refresh');
            const { data: { session: refreshedSession }, error: refreshError } =
                await supabase.auth.refreshSession();

            if (refreshError) {
                console.error('Error refreshing session:', refreshError);
                await handleRefreshTokenError(refreshError);
                return null;
            }

            return refreshedSession;
        }

        return session;
    } catch (error) {
        console.error('Error checking session:', error);
        await handleRefreshTokenError(error);
        return null;
    }
} 