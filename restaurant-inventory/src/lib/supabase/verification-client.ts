"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a specialized Supabase client for auth verification
 * This client has specialized settings for handling auth callbacks
 */
export function createVerificationClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            storageKey: "supabase-auth-token",
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce",
        },
    });
}

// For direct imports when needed
export const verificationClient = createVerificationClient();