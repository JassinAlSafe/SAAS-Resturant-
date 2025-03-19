"use client";

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient, PostgrestError, AuthChangeEvent } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log environment variable status for debugging
console.log("Supabase URL defined:", !!supabaseUrl, supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "undefined");
console.log("Supabase Anon Key defined:", !!supabaseAnonKey, supabaseAnonKey ? "Key exists (not showing for security)" : "undefined");

// Auth initialization tracking 
let isAuthInitialized = false;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
}

// Initialize the Supabase client with proper API key handling
const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            storageKey: 'auth-storage',
        },
        global: {
            headers: {
                apikey: supabaseAnonKey,
                'Content-Type': 'application/json',
            },
            fetch: async (url, options = {}) => {
                // Force-add the apikey to every request
                const apikey = supabaseAnonKey;
                const apiUrl = new URL(url.toString());

                // Add as URL parameter for extra reliability if not already present
                if (!apiUrl.searchParams.has('apikey')) {
                    apiUrl.searchParams.set('apikey', apikey);
                }

                // Ensure headers object exists
                options.headers = options.headers || {};

                // Always add the required headers with higher precedence
                options.headers = {
                    'apikey': apikey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Client-Info': 'restaurant-inventory',
                    ...options.headers
                };

                // Debugging info
                console.log(`Making Supabase request to: ${apiUrl.pathname}`);
                const hasApiKey = options.headers && 'apikey' in options.headers;
                const hasContentType = options.headers && 'Content-Type' in options.headers;
                console.log(`Request headers check - API key: ${hasApiKey}, Content-Type: ${hasContentType}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                try {
                    const response = await fetch(apiUrl.toString(), {
                        ...options,
                        signal: controller.signal,
                    });

                    if (!response.ok && process.env.NODE_ENV === 'development') {
                        console.warn(`Supabase request failed: ${response.status} ${response.statusText}`);
                        // Log more details for auth-related errors
                        if (url.toString().includes('/auth/')) {
                            console.warn(`Auth request failed with status: ${response.status}`);
                            try {
                                const errorBody = await response.clone().text();
                                console.warn(`Error response: ${errorBody}`);
                            } catch {
                                console.warn('Could not read error response');
                            }
                        }
                    }

                    return response;
                } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        console.error('Supabase request timed out');
                    } else {
                        console.error('Supabase request failed:', error);
                    }
                    throw error;
                } finally {
                    clearTimeout(timeoutId);
                }
            }
        }
    }
);

// Set up auth state change listener after client creation
if (typeof window !== 'undefined') {
    supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
        if (event === 'SIGNED_OUT') {
            // Clear local storage auth data explicitly on signout
            localStorage.removeItem('auth-storage');
        }
    });
}

// Export the client
export { supabase };

// Helper function to wait for auth initialization to complete
export const waitForAuthInit = async (timeoutMs = 30000): Promise<boolean> => {
    return new Promise((resolve) => {
        if (isAuthInitialized) {
            resolve(true);
            return;
        }

        const timeoutId = setTimeout(() => {
            console.warn('Auth initialization timeout reached');
            resolve(false);
        }, timeoutMs);

        const checkInterval = setInterval(() => {
            if (isAuthInitialized) {
                clearTimeout(timeoutId);
                clearInterval(checkInterval);
                resolve(true);
            }
        }, 100);
    });
};

// Add a helper function to check auth status safely
export async function checkAuthStatus() {
    try {
        // Wait for auth to initialize first
        await waitForAuthInit();

        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Auth status check failed:', error);
            return { authenticated: false, user: null };
        }
        return {
            authenticated: !!data.user,
            user: data.user
        };
    } catch (error: unknown) {
        console.error('Unexpected error checking auth status:', error);
        return { authenticated: false, user: null };
    }
}

// Add a function to safely execute Supabase queries
export async function safeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: PostgrestError | Error | null }>
): Promise<{ data: T | null; error: PostgrestError | Error | null }> {
    try {
        // Wait for auth to initialize first
        await waitForAuthInit();

        // Check auth status
        const { authenticated } = await checkAuthStatus();
        if (!authenticated) {
            return { data: null, error: new Error('Not authenticated') };
        }

        // Run the query function
        return await queryFn(supabase);
    } catch (error: unknown) {
        console.error('Error executing Supabase query:', error);
        const errorResponse = error instanceof Error ? error : new Error('Unknown error occurred');
        return { data: null, error: errorResponse };
    }
}

// Add session recovery logic
export async function recoverSession() {
    try {
        // Check if we're on a login or auth page where errors are expected
        const onAuthPage = isAuthPage();
        if (onAuthPage) {
            // On auth pages, we can skip session recovery to avoid unnecessary errors
            console.log("On auth page - skipping session recovery");
            return false;
        }

        // Wait for auth to initialize first
        await waitForAuthInit();

        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
            console.log("No valid session to recover");
            return false;
        }

        // Check if the session is close to expiry
        const expiresAt = data.session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const buffer = 60 * 5; // 5 minutes buffer

        // Only refresh if we're within 5 minutes of expiry or already expired
        if (expiresAt && (expiresAt - now < buffer)) {
            console.log("Session near expiry, attempting to refresh");
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
                console.error("Error refreshing session:", refreshError);
                return false;
            }
            return !!refreshData.session;
        }

        // Session exists and is not close to expiry
        return true;
    } catch (e) {
        console.error("Error recovering session:", e);
        return false;
    }
}

// Enhanced function to handle AuthSessionMissingError gracefully
export async function handleAuthError(error: unknown) {
    console.log("Handling auth error:", error);

    // Check if it's an auth session error
    if (error instanceof Error &&
        (error.message.includes("session") ||
            error.message.includes("JWT") ||
            error.message.includes("authentication"))) {
        try {
            // Wait for auth to initialize first
            await waitForAuthInit();

            // First try refreshing the current session
            const { data, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && data.session) {
                console.log("Session refreshed successfully");
                return true;
            }

            if (refreshError) {
                console.error("Failed to refresh session:", refreshError);
            }

            // If refresh failed, try to get the existing session
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
                console.log("Retrieved existing session");
                return true;
            }

            // Clear auth state if recovery failed
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage');
            }
        } catch (e) {
            console.error("Error during session recovery:", e);
        }
    }
    return false;
}

/**
 * Helper function to determine if we're on an auth page
 * Auth pages don't need to aggressively refresh tokens
 */
export function isAuthPage(): boolean {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname;
    return pathname.includes('/login') ||
        pathname.includes('/signup') ||
        pathname.includes('/reset-password') ||
        pathname.includes('/auth/callback');
}

/**
 * Wrapper for recoverSession that suppresses errors on auth pages
 * This helps reduce unnecessary error logging on pages where auth is optional
 */
export async function recoverSessionWithErrorHandling(): Promise<boolean> {
    try {
        // On auth pages, suppress errors since they're expected
        const suppressErrors = isAuthPage();

        if (suppressErrors) {
            console.log("On auth page - suppressing token refresh errors");
        }

        return await recoverSession();
    } catch (error) {
        console.error("Error in recoverSessionWithErrorHandling:", error);
        return false;
    }
}

/**
 * Wrapper function to ensure operations are performed with an authenticated client
 * This ensures auth is initialized before any database operations
 */
export async function withAuthenticatedSupabase<T>(
    operation: (client: typeof supabase) => Promise<T>
): Promise<T> {
    // Ensure auth is initialized
    const isInitialized = await waitForAuthInit();

    if (!isInitialized) {
        console.error("Auth initialization failed, database operations may not work");
    }

    // Get current auth state
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Session error before database operation:", error);
        throw new Error(`Authentication error: ${error.message}`);
    }

    if (!data.session) {
        console.error("No valid session for database operation");
        throw new Error("Authentication required");
    }

    // Now perform the operation with the authenticated client
    return operation(supabase);
}

/**
 * Waits for authentication to be initialized with a configurable timeout
 * Returns true if authentication was initialized within the timeout period, false otherwise
 */
export async function waitForAuthWithTimeout(timeout = 5000): Promise<boolean> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        // Check if already initialized
        if (isAuthInitialized) {
            console.log("Auth already initialized, proceeding immediately");
            return resolve(true);
        }

        console.log(`Waiting for auth initialization (timeout: ${timeout}ms)`);

        // Poll for changes
        const checkInterval = 100; // Check every 100ms
        const intervalId = setInterval(() => {
            if (isAuthInitialized) {
                const elapsed = Date.now() - startTime;
                console.log(`Auth initialized after ${elapsed}ms`);
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                resolve(true);
            }
        }, checkInterval);

        // Set a timeout as a fallback
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            console.warn(`Auth initialization timeout reached after ${timeout}ms`);
            resolve(false);
        }, timeout);
    });
}

// Function to set auth initialization status
export const setAuthInitialized = (status: boolean) => {
    isAuthInitialized = status;
};