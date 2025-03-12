import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client for API routes
export const createServerSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error(
            'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
        );
        throw new Error('Missing Supabase credentials');
    }

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
        }
    });
};

// Export a pre-initialized instance for convenience
export const supabaseServer = createServerSupabaseClient(); 