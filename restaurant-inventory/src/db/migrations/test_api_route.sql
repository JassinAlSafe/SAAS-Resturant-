-- Test API Route Access
-- This script helps diagnose issues with the API route for restaurant-icons

-- First, check if the get_policies_for_bucket function exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_proc 
        WHERE proname = 'get_policies_for_bucket'
    ) THEN
        RAISE NOTICE 'get_policies_for_bucket function exists';
    ELSE
        RAISE NOTICE 'get_policies_for_bucket function does NOT exist';
        
        -- Create the function if it doesn't exist
        CREATE OR REPLACE FUNCTION get_policies_for_bucket(bucket_name TEXT)
        RETURNS TABLE (
            name TEXT,
            operation TEXT,
            definition TEXT,
            roles TEXT[]
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                p.policyname::TEXT AS name,
                p.cmd::TEXT AS operation,
                COALESCE(p.qual::TEXT, '') || CASE WHEN p.with_check IS NOT NULL THEN ' WITH CHECK ' || p.with_check::TEXT ELSE '' END AS definition,
                p.roles AS roles
            FROM 
                pg_policies p
            WHERE 
                p.schemaname = 'storage' AND
                (
                    (p.tablename = 'buckets' AND p.qual::TEXT LIKE '%' || bucket_name || '%') OR
                    (p.tablename = 'objects' AND (
                        p.qual::TEXT LIKE '%' || bucket_name || '%' OR
                        p.with_check::TEXT LIKE '%' || bucket_name || '%'
                    ))
                );
        END;
        $$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Created get_policies_for_bucket function';
    END IF;
END $$;

-- Test the function
SELECT * FROM get_policies_for_bucket('restaurant-icons');

-- Check if the API route can access the bucket
DO $$
DECLARE
    bucket_exists BOOLEAN;
    current_user_id TEXT;
BEGIN
    -- Get the current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Check if the bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'restaurant-icons'
    ) INTO bucket_exists;
    
    RAISE NOTICE 'Current user ID: %', current_user_id;
    RAISE NOTICE 'Bucket exists: %', bucket_exists;
    
    -- Check if the user can access the bucket
    IF current_user_id IS NOT NULL AND bucket_exists THEN
        RAISE NOTICE 'Testing bucket access...';
        
        BEGIN
            -- Try to create a test folder
            DECLARE
                test_path TEXT := current_user_id || '/.api_test';
                test_content BYTEA := '\x';
            BEGIN
                -- Try to upload a test file
                INSERT INTO storage.objects (bucket_id, name, owner, size, metadata)
                VALUES (
                    'restaurant-icons',
                    test_path,
                    current_user_id,
                    0,
                    '{"mimetype": "application/octet-stream"}'
                );
                
                RAISE NOTICE 'Successfully created test folder';
                
                -- Clean up
                DELETE FROM storage.objects 
                WHERE bucket_id = 'restaurant-icons' AND name = test_path;
                
                RAISE NOTICE 'Test folder deleted';
            END;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error testing bucket access: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Cannot test bucket access - user not authenticated or bucket does not exist';
    END IF;
END $$;

-- Output summary
DO $$
BEGIN
    RAISE NOTICE '-----------------------------------------------';
    RAISE NOTICE 'API ROUTE TEST COMPLETE';
    RAISE NOTICE '-----------------------------------------------';
    RAISE NOTICE 'If you see any errors above, try running the emergency_fix.sql script.';
    RAISE NOTICE 'This will temporarily disable RLS restrictions to get your app working.';
    RAISE NOTICE '';
    RAISE NOTICE 'After confirming the app works, you can apply the proper security policies.';
END $$; 