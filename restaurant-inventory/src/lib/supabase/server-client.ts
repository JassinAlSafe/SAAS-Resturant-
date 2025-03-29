import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for use in server components and API routes
 * Uses the correct SSR pattern with cookie handling
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

/**
 * Helper function to get the current session
 */
export async function getServerSession() {
    const supabase = await createServerSupabaseClient();

    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        return { session };
    } catch (error) {
        console.error("Error getting server session:", error);
        return { session: null };
    }
}

/**
 * Helper function to get the current user
 */
export async function getServerUser() {
    const { session } = await getServerSession();
    return { user: session?.user ?? null };
}

/**
 * Helper function to check if a user is authenticated
 */
export async function isAuthenticated() {
    const { user } = await getServerUser();
    return !!user;
}