"use client";

import { createBrowserClient } from '@supabase/ssr';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
}

// Create the Supabase client with persistent session handling
let supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
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
        }
    });
} catch (error) {
    console.error('Error initializing Supabase client:', error);
    // If there was an error, recreate the client
    supabase = createBrowserClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
        auth: {
            persistSession: true,
            storageKey: 'supabase-auth-token',
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    });
}

export { supabase };