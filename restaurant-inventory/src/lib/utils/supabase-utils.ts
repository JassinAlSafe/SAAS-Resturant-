import { supabase, withAuthenticatedSupabase } from '@/lib/supabase';
import { waitForAuthWithTimeout } from "@/lib/utils/auth-utils";

/**
 * Tests the Supabase connection by running a simple query
 * This can be used to diagnose connection issues
 */
export async function testSupabaseConnection() {
    try {
        // First, test with a simple query that doesn't require authentication
        const { error: anonError } = await supabase
            .from('business_profiles')
            .select('count(*)', { count: 'exact', head: true });

        // Check for API key issues in the anon query
        if (anonError) {
            console.error("Supabase connection test failed:", {
                message: anonError?.message || "No message",
                code: anonError?.code,
                details: anonError?.details,
                hint: anonError?.hint
            });

            // Check specifically for API key issues
            if (anonError.message?.includes('API key') ||
                anonError.message?.includes('apikey') ||
                anonError.code === '401') {
                console.error("API key issue detected:", anonError);
                return { success: false, reason: 'api_key', error: anonError };
            }

            // If it's a permission error, try with authenticated client
            if (anonError.code === '42501' || anonError.message?.includes('permission')) {
                return await testAuthenticatedConnection();
            }

            return { success: false, reason: 'query_error', error: anonError };
        }

        console.log("Supabase anon connection successful");

        // Also test authenticated connection
        const authResult = await testAuthenticatedConnection();
        if (!authResult.success) {
            console.warn("Anon connection works but authenticated failed:", authResult);
            return { success: true, authSuccess: false, reason: authResult.reason };
        }

        return { success: true, authSuccess: true };
    } catch (err) {
        console.error("Supabase connection test exception:", err);
        return { success: false, reason: 'exception', error: err };
    }
}

/**
 * Tests the Supabase connection with authentication
 */
async function testAuthenticatedConnection() {
    try {
        // Try to use the withAuthenticatedSupabase wrapper
        const result = await withAuthenticatedSupabase(async (client) => {
            const { error } = await client
                .from('business_profiles')
                .select('count(*)', { count: 'exact', head: true });

            if (error) {
                console.error("Authenticated connection test failed:", {
                    message: error?.message || "No message",
                    code: error?.code,
                    details: error?.details,
                    hint: error?.hint
                });

                if (error.message?.includes('API key') ||
                    error.message?.includes('apikey') ||
                    error.code === '401') {
                    return { success: false, reason: 'api_key', error };
                }

                return { success: false, reason: 'query_error', error };
            }

            return { success: true };
        }).catch(err => {
            if (err.message?.includes('Authentication required')) {
                return { success: false, reason: 'not_authenticated' };
            }
            return { success: false, reason: 'auth_wrapper_error', error: err };
        });

        return result;
    } catch (err) {
        console.error("Authenticated connection test exception:", err);
        return { success: false, reason: 'exception', error: err };
    }
}

/**
 * A simple ping test that uses a direct REST call to verify API key inclusion
 * This avoids issues with table permissions
 */
export async function pingSupabase() {
    try {
        console.log("Pinging Supabase with explicit API key...");

        // Make a direct fetch call with the API key explicitly included
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            }
        });

        console.log("Ping response status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ping failed:", {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            return {
                success: false,
                status: response.status,
                error: `Failed with status ${response.status}: ${errorText}`
            };
        }

        const data = await response.json();
        console.log("Ping successful:", data);

        return { success: true, data };
    } catch (err) {
        console.error("Ping exception:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error"
        };
    }
}

/**
 * A basic health check that tests direct REST API access to Supabase
 */
export async function healthCheck() {
    try {
        console.log("Running Supabase health check...");

        // Check that we have the required environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase credentials in environment variables");
            return {
                success: false,
                error: "Missing Supabase credentials"
            };
        }

        // Use a more reliable endpoint - the REST API endpoint is more consistent
        // than the auth endpoint which might have different paths in different versions
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
            }
        });

        console.log("Health check response status:", response.status, response.statusText);

        // Check for unauthorized responses which would indicate an API key issue
        if (response.status === 401) {
            const errorText = await response.text();
            console.error("Health check failed - API key issue:", {
                status: response.status,
                body: errorText
            });
            return {
                success: false,
                status: response.status,
                error: `API key issue: ${errorText}`
            };
        }

        // If we got a 200 OK response, the connection is good
        if (response.ok) {
            return {
                success: true,
                status: response.status
            };
        }

        // For other error codes, log but still consider connected if it's not an auth issue
        console.warn(`Health check received non-200 response: ${response.status}`);
        return {
            success: true, // Still consider successful if it's not a 401
            status: response.status,
            warning: `Received status ${response.status}, but API key seems valid`
        };
    } catch (err) {
        console.error("Health check exception:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error"
        };
    }
}

/**
 * Test different database tables to isolate where permission issues might occur
 * This helps identify if the problem is specific to one table
 */
export async function testDatabaseTables() {
    type TestResult = {
        success: boolean;
        error: null | {
            message: string;
            code: string;
            hint?: string;
        };
        exists?: boolean;
    };

    const results: Record<string, TestResult> = {};

    // Log all headers for the request
    const logHeaders = async () => {
        try {
            // Intercept a request to examine headers
            const originalFetch = global.fetch;
            let logged = false;

            global.fetch = function (input, init) {
                if (!logged && typeof input === 'string' && input.includes('supabase.co')) {
                    console.log('Supabase request URL:', input);
                    console.log('Supabase request headers:', init?.headers);
                    logged = true;
                    global.fetch = originalFetch;
                }
                return originalFetch(input, init);
            };

            // Make a test request
            await supabase.from('business_profiles').select('count(*)').limit(1);
        } catch (err) {
            console.error("Header logging error:", err);
        }
    };

    try {
        // Log headers first to examine the request structure
        await logHeaders();

        // Ensure we have authentication before running database tests
        const authResult = await ensureAuthForTesting();
        results.authentication = {
            success: authResult.success,
            error: !authResult.success ? {
                message: authResult.error || "Failed to authenticate",
                code: "AUTH_ERROR"
            } : null
        };

        // If we couldn't authenticate, we should stop here since RLS will block all access
        if (!authResult.success) {
            console.error("Cannot proceed with database tests: Authentication required");
            return {
                success: false,
                message: "Authentication required for database access due to RLS policies",
                results
            };
        }

        console.log(`Testing with ${authResult.method} authentication`);

        // 1. Test business_profiles table
        console.log("\n--- Testing business_profiles table ---");
        const { error: profilesError } = await supabase
            .from('business_profiles')
            .select('count(*)', { count: 'exact', head: true });

        results.business_profiles = {
            success: !profilesError,
            error: profilesError ? {
                message: profilesError.message,
                code: profilesError.code,
                hint: profilesError.hint
            } : null
        };

        // 2. Test business_profile_users junction table
        console.log("\n--- Testing business_profile_users table ---");
        const { error: profileUsersError } = await supabase
            .from('business_profile_users')
            .select('count(*)', { count: 'exact', head: true });

        results.business_profile_users = {
            success: !profileUsersError,
            error: profileUsersError ? {
                message: profileUsersError.message,
                code: profileUsersError.code,
                hint: profileUsersError.hint
            } : null
        };

        // 3. Test profiles table (user profiles)
        console.log("\n--- Testing profiles table ---");
        const { error: userProfilesError } = await supabase
            .from('profiles')
            .select('count(*)', { count: 'exact', head: true });

        results.profiles = {
            success: !userProfilesError,
            error: userProfilesError ? {
                message: userProfilesError.message,
                code: userProfilesError.code,
                hint: userProfilesError.hint
            } : null
        };

        // 4. Test items table
        console.log("\n--- Testing items table ---");
        const { error: itemsError } = await supabase
            .from('items')
            .select('count(*)', { count: 'exact', head: true });

        results.items = {
            success: !itemsError,
            error: itemsError ? {
                message: itemsError.message,
                code: itemsError.code,
                hint: itemsError.hint
            } : null
        };

        // 5. Test item categories
        console.log("\n--- Testing item_categories table ---");
        const { error: categoriesError } = await supabase
            .from('item_categories')
            .select('count(*)', { count: 'exact', head: true });

        results.item_categories = {
            success: !categoriesError,
            error: categoriesError ? {
                message: categoriesError.message,
                code: categoriesError.code,
                hint: categoriesError.hint
            } : null
        };

        // Check if all tests passed
        const allSuccessful = Object.values(results).every(result => result.success);

        return {
            success: allSuccessful,
            message: allSuccessful
                ? "All database tables are accessible"
                : "Some database tables cannot be accessed. Check RLS policies.",
            results
        };

    } catch (error) {
        console.error("Error testing database tables:", error);
        return {
            success: false,
            message: "Error running database tests",
            error: error instanceof Error ? error.message : "Unknown error",
            results
        };
    }
}

/**
 * Ensures authentication is available for testing database access
 * This can use a test account in development mode if no session is available
 */
export async function ensureAuthForTesting(): Promise<{
    success: boolean;
    method?: 'existing-session' | 'test-account';
    error?: string;
}> {
    try {
        // First, wait for authentication to be initialized
        const isInitialized = await waitForAuthWithTimeout(3000);
        if (!isInitialized) {
            console.warn("Authentication initialization timed out, proceeding with available state");
        }

        // Check if we already have an active session
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session) {
            console.log("Using existing active session for database tests");
            return {
                success: true,
                method: 'existing-session'
            };
        }

        // In development, we can try to authenticate with test credentials
        if (process.env.NODE_ENV === 'development') {
            console.log("No active session found, attempting to sign in with test account");

            // Try to use environment variables for test credentials if available
            const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL || 'test@example.com';
            const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;

            if (!testPassword) {
                return {
                    success: false,
                    error: "No test credentials available. Set NEXT_PUBLIC_TEST_EMAIL and NEXT_PUBLIC_TEST_PASSWORD in .env.local"
                };
            }

            // Attempt to sign in with test credentials
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword
            });

            if (signInError) {
                console.error("Failed to sign in with test account:", signInError.message);
                return {
                    success: false,
                    error: `Test account sign-in failed: ${signInError.message}`
                };
            }

            if (signInData?.session) {
                console.log("Successfully signed in with test account");
                return {
                    success: true,
                    method: 'test-account'
                };
            }
        }

        // If we get here, we couldn't authenticate
        return {
            success: false,
            error: "No active session and test account login not available or failed"
        };
    } catch (error) {
        console.error("Error ensuring authentication for testing:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error during authentication"
        };
    }
}