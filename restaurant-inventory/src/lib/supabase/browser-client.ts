"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
} else {
    console.log("Supabase URL is set:", supabaseUrl);
    console.log(
        "Supabase Anon Key is set (first 10 chars):",
        supabaseAnonKey.substring(0, 10)
    );
}

// Create the standard browser client
export const createClient = (): SupabaseClient => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            storageKey: "supabase-auth-token",
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
};

// Function to create a client with session persistence disabled for logout
export const createLogoutClient = (): SupabaseClient => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            storageKey: "supabase-auth-token",
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
};

// Create singleton instance for direct imports
export const supabase = createClient();

// Handle errors safely
try {
    // Test the connection
    supabase.auth.getSession().then((result) => {
        if (result.error) {
            console.error("Error connecting to Supabase:", result.error);
        } else {
            console.log("Supabase client initialized successfully");
            console.log("Session exists:", !!result.data.session);
            if (result.data.session) {
                console.log(
                    "User is authenticated. User ID:",
                    result.data.session.user.id
                );
            } else {
                console.log("No active session found. User needs to log in.");
            }
        }
    });
} catch (error) {
    console.error("Error initializing Supabase client:", error);
}