import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple test endpoint to check Supabase connection and table existence
export async function GET() {
    try {
        // Step 1: Test basic connection with a simple query
        const { data: connectionTest, error: connectionError } = await supabase
            .from('profiles')
            .select('count(*)', { count: 'exact', head: true });

        // Step 2: Check if business_profiles table exists
        const { data: tableExists, error: tableError } = await supabase
            .from('business_profiles')
            .select('count(*)', { count: 'exact', head: true })
            .limit(1);

        // Step 3: Try to create a test row (this will fail if the table doesn't exist)
        const testRow = {
            user_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
            name: 'Test Restaurant',
            type: 'test',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: insertTest, error: insertError } = await supabase
            .from('business_profiles')
            .insert(testRow)
            .select()
            .single();

        // Clean up the test row
        let deleteResult = null;
        let deleteError = null;

        if (insertTest?.id) {
            const { data, error } = await supabase
                .from('business_profiles')
                .delete()
                .eq('id', insertTest.id);

            deleteResult = data;
            deleteError = error;
        }

        return NextResponse.json({
            success: true,
            connection: {
                success: !connectionError,
                error: connectionError,
                data: connectionTest
            },
            businessProfilesTable: {
                exists: !tableError,
                error: tableError,
                data: tableExists
            },
            insertTest: {
                success: !insertError,
                error: insertError,
                data: insertTest
            },
            deleteTest: {
                success: !deleteError,
                error: deleteError,
                data: deleteResult
            }
        });
    } catch (error) {
        console.error('Test Supabase API error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 