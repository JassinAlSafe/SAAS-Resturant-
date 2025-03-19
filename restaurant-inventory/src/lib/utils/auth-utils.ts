import { useAuthStore } from '@/lib/stores/auth-store';
import { supabase } from '@/lib/supabase';

/**
 * Waits for authentication to be initialized with a configurable timeout
 * Returns true if authentication was initialized within the timeout period, false otherwise
 */
export async function waitForAuthWithTimeout(timeout = 10000): Promise<boolean> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        // Check if auth is no longer loading (indicates init completed)
        if (!useAuthStore.getState().isLoading) {
            console.log("Auth already initialized, proceeding immediately");
            return resolve(true);
        }

        console.log(`Waiting for auth initialization (timeout: ${timeout}ms)`);

        // Poll for changes
        const checkInterval = 100; // Check every 100ms
        const intervalId = setInterval(() => {
            // Consider auth initialized when it's no longer loading
            if (!useAuthStore.getState().isLoading) {
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

            // Log additional diagnostic info
            console.error('Auth store state at timeout:', {
                isLoading: useAuthStore.getState().isLoading,
                hasUser: !!useAuthStore.getState().user,
                isAuthenticated: useAuthStore.getState().isAuthenticated,
                hasError: !!useAuthStore.getState().error
            });

            resolve(false);
        }, timeout);
    });
}

/**
 * Force initialization of authentication if needed
 */
export async function ensureAuthInitialized(): Promise<boolean> {
    // If already initialized (not loading), return immediately
    if (!useAuthStore.getState().isLoading) {
        return true;
    }

    // Otherwise, attempt to initialize
    try {
        const { initialize } = useAuthStore.getState();
        await initialize();

        // Wait for initialization to complete
        return waitForAuthWithTimeout();
    } catch (error) {
        console.error("Failed to initialize authentication:", error);
        return false;
    }
}

/**
 * Wrapper function to ensure operations only execute with an active session
 * If no session is present, it throws a clear error
 * @param operation The function to execute with authentication
 * @returns The result of the operation
 */
export async function withAuthentication<T>(operation: () => Promise<T>): Promise<T> {
    // Wait for auth to be initialized
    const initialized = await waitForAuthWithTimeout();
    if (!initialized) {
        console.warn("Authentication initialization timed out, proceeding with available state");
    }

    // Get current auth state
    const { data: { session } } = await supabase.auth.getSession();

    // If we have a session, run the operation
    if (session) {
        return operation();
    }

    // If we don't have a session and auth is initialized (not loading), throw a clear error
    if (!useAuthStore.getState().isLoading) {
        throw new Error('Authentication required for this operation');
    } else {
        // If auth isn't initialized yet, it's a system issue
        throw new Error('Authentication system not ready. Please try again later.');
    }
} 