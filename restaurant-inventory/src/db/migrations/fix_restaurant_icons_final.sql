-- FINAL FIX: Comprehensive RLS Policies for restaurant-icons bucket
-- This script consolidates previous approaches and ensures proper user-specific permissions

-- Check if the restaurant-icons bucket exists
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'restaurant-icons'
    ) INTO bucket_exists;

    IF NOT bucket_exists THEN
        -- Create the restaurant-icons bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'restaurant-icons',
            'restaurant-icons',
            FALSE,
            5242880, -- 5MB
            '{image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp}'
        );
        RAISE NOTICE 'Created restaurant-icons bucket';
    ELSE
        RAISE NOTICE 'restaurant-icons bucket already exists';
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for restaurant-icons bucket (both naming conventions)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE 
            schemaname = 'storage' AND 
            tablename IN ('buckets', 'objects') AND
            (
                policyname LIKE '%restaurant-icons%' OR 
                policyname LIKE '%restaurant_icons%' OR
                (
                    (qual::text LIKE '%restaurant-icons%' OR 
                    with_check::text LIKE '%restaurant-icons%')
                )
            )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.%I', 
                      policy_record.policyname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on table %', 
                    policy_record.policyname, 
                    policy_record.tablename;
    END LOOP;
END $$;

-- Create new policies with proper user-specific permissions
-- 1. Bucket access policy
CREATE POLICY "restaurant_icons_bucket_access" 
    ON storage.buckets
    FOR SELECT
    TO authenticated
    USING (name = 'restaurant-icons');

-- 2. Object select policy (read)
CREATE POLICY "restaurant_icons_object_select" 
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'restaurant-icons');

-- 3. Object insert policy (upload) - user can only upload to their own folder
CREATE POLICY "restaurant_icons_object_insert" 
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'restaurant-icons' AND
        (
            -- Ensure users can only upload to their own folder
            (storage.foldername(name))[1] = auth.uid()::text OR
            -- Allow direct upload to user's root folder
            name = auth.uid() || '/.placeholder'
        )
    );

-- 4. Object update policy - user can only update their own files
CREATE POLICY "restaurant_icons_object_update" 
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        owner = auth.uid()
    )
    WITH CHECK (
        bucket_id = 'restaurant-icons' AND
        owner = auth.uid()
    );

-- 5. Object delete policy - user can only delete their own files
CREATE POLICY "restaurant_icons_object_delete" 
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        owner = auth.uid()
    );

-- Grant necessary permissions to authenticated role
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Create or replace the helper function to get policies for a bucket
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

-- Test the policies by creating a test object
DO $$
DECLARE
    current_user_id TEXT;
BEGIN
    -- Get the current user ID
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        BEGIN
            -- Try to create a test object
            INSERT INTO storage.objects (bucket_id, name, owner, size, metadata)
            VALUES (
                'restaurant-icons',
                current_user_id || '/.test_permissions',
                current_user_id,
                0,
                '{"mimetype": "text/plain"}'
            );
            RAISE NOTICE 'Successfully created test object for user %', current_user_id;
            
            -- Clean up the test object
            DELETE FROM storage.objects 
            WHERE bucket_id = 'restaurant-icons' AND name = current_user_id || '/.test_permissions';
            RAISE NOTICE 'Test object deleted';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error testing policies: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No authenticated user found, skipping test';
    END IF;
END $$;

-- Verify the policies were created
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename IN ('buckets', 'objects')
    AND schemaname = 'storage'
    AND (
        policyname LIKE '%restaurant_icons%' OR
        qual::text LIKE '%restaurant-icons%' OR
        with_check::text LIKE '%restaurant-icons%'
    );

-- Output success message
DO $$
BEGIN
    RAISE NOTICE '-----------------------------------------------';
    RAISE NOTICE 'RESTAURANT ICONS BUCKET RLS POLICIES INSTALLED';
    RAISE NOTICE '-----------------------------------------------';
    RAISE NOTICE 'The restaurant-icons bucket is now properly configured with RLS policies.';
    RAISE NOTICE 'Users can only access, upload, update, and delete their own files.';
    RAISE NOTICE 'To test, try uploading a logo in the Business Profile settings.';
END $$; 