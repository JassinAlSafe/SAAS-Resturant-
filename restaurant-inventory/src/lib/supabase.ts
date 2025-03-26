"use client";

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
} else {
    console.log('Supabase URL is set:', supabaseUrl);
    console.log('Supabase Anon Key is set (first 10 chars):', supabaseAnonKey.substring(0, 10));
}

// Create the Supabase client with persistent session handling
const supabase: SupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'supabase-auth-token',
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});

// Handle errors safely
try {
    // Test the connection
    supabase.auth.getSession().then((result) => {
        if (result.error) {
            console.error('Error connecting to Supabase:', result.error);
        } else {
            console.log('Supabase client initialized successfully');
            console.log('Session exists:', !!result.data.session);
            if (result.data.session) {
                console.log('User is authenticated. User ID:', result.data.session.user.id);
            } else {
                console.log('No active session found. User needs to log in.');
            }
        }
    });
} catch (error) {
    console.error('Error initializing Supabase client:', error);
}

// Function to reinitialize the Supabase client with session persistence disabled
// This can be called during logout to ensure no session persistence
export const getLogoutClient = (): SupabaseClient => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            storageKey: 'supabase-auth-token',
            autoRefreshToken: false,
            detectSessionInUrl: false,
        }
    });
};

export { supabase };