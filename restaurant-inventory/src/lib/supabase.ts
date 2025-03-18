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

// Variable to store connection status
let isConnectionVerified = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

// Create the Supabase client
let supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Define a function to test the connection with a retry mechanism
// but don't treat auth session missing as an error for non-authenticated users
const verifyConnection = async (retry = 0): Promise<boolean> => {
    if (isConnectionVerified || retry >= MAX_RETRIES) return isConnectionVerified;

    try {
        connectionAttempts++;
        const { error } = await supabase.auth.getUser();

        // If we get an AuthSessionMissingError, it just means the user isn't logged in
        // This isn't a connection error, just an authentication state
        if (error && !error.message.includes('Auth session missing')) {
            console.warn(`Supabase connection attempt ${connectionAttempts} failed:`, error);

            if (retry < MAX_RETRIES - 1) {
                console.log(`Retrying connection (attempt ${connectionAttempts + 1})...`);
                // Create a new client instance for retry
                supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retry)));
                return verifyConnection(retry + 1);
            }

            return false;
        }

        // If we have user data or the only error was auth missing, the connection is working
        console.log('Supabase client initialized successfully');
        isConnectionVerified = true;
        return true;
    } catch (error) {
        console.error('Error during Supabase connection verification:', error);
        return false;
    }
};

// Verify connection immediately but don't block execution
verifyConnection();

export { supabase }; 