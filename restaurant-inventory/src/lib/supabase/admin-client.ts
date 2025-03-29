import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 * 
 * IMPORTANT: This client bypasses Row Level Security (RLS) policies.
 * It should ONLY be used in server-side code, never exposed to the client.
 * 
 * Use cases:
 * - Administrative operations that need to bypass RLS
 * - Background jobs and server-side operations
 * - Webhooks and API endpoints that need elevated privileges
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate admin credentials
if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
        "Missing Supabase admin credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
}

// Create the Supabase admin client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});