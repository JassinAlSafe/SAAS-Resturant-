import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Debug endpoint to check Supabase connection and tables
export async function GET() {
    try {
        // Test Supabase connection
        const { data: tablesData, error: tablesError } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename, schemaname')
            .eq('schemaname', 'public')
            .order('tablename');

        if (tablesError) {
            return NextResponse.json({
                status: 'error',
                message: 'Failed to query tables',
                error: tablesError
            }, { status: 500 });
        }

        // Check if business_profiles table exists
        const hasBusinessProfilesTable = tablesData?.some(
            (table) => table.tablename === 'business_profiles'
        );

        // If it exists, check the structure
        let businessProfilesStructure = null;
        if (hasBusinessProfilesTable) {
            const { data: columnsData, error: columnsError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable')
                .eq('table_name', 'business_profiles')
                .order('column_name');

            if (columnsError) {
                return NextResponse.json({
                    status: 'error',
                    message: 'Failed to query business_profiles structure',
                    error: columnsError
                }, { status: 500 });
            }

            businessProfilesStructure = columnsData;
        }

        // Try a direct query to the business_profiles table if it exists
        let businessProfiles = null;
        let directQueryError = null;
        if (hasBusinessProfilesTable) {
            try {
                const { data, error } = await supabase
                    .from('business_profiles')
                    .select('id, user_id, name')
                    .limit(5);

                if (error) {
                    directQueryError = error;
                } else {
                    businessProfiles = data;
                }
            } catch (e) {
                directQueryError = e;
            }
        }

        return NextResponse.json({
            status: 'success',
            supabase: {
                connected: true,
                tables: tablesData,
                hasBusinessProfilesTable,
                businessProfilesStructure,
                businessProfiles,
                directQueryError
            }
        });
    } catch (error) {
        console.error('Debug API error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Debug API error',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 