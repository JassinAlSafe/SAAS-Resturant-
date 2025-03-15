-- Fix Bucket Permissions for restaurant-icons
-- This script provides a direct fix for RLS policy issues with the restaurant-icons bucket

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

-- Drop all existing policies for restaurant-icons bucket
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE 
            schemaname = 'storage' AND 
            tablename IN ('buckets', 'objects') AND
            (policyname LIKE '%restaurant-icons%' OR policyname LIKE '%restaurant_icons%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.%I', 
                      policy_record.policyname, 
                      (SELECT tablename FROM pg_policies WHERE policyname = policy_record.policyname LIMIT 1));
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Create new policies with explicit roles
-- Bucket access policy
CREATE POLICY "Restaurant Icons Bucket Access"
    ON storage.buckets
    FOR SELECT
    TO authenticated
    USING (name = 'restaurant-icons');

-- Object select policy for authenticated users
CREATE POLICY "Restaurant Icons Object Select"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'restaurant-icons');

-- Object insert policy for authenticated users
CREATE POLICY "Restaurant Icons Object Insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'restaurant-icons' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Object update policy for authenticated users
CREATE POLICY "Restaurant Icons Object Update"
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

-- Object delete policy for authenticated users
CREATE POLICY "Restaurant Icons Object Delete"
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

-- Create a temporary table to store the current user's ID
CREATE TEMP TABLE IF NOT EXISTS current_user_id AS
SELECT auth.uid() AS user_id;

-- Try to create a test object to verify permissions
DO $$
BEGIN
    BEGIN
        INSERT INTO storage.objects (bucket_id, name, owner, size, metadata)
        VALUES (
            'restaurant-icons',
            (SELECT user_id FROM current_user_id) || '/.test_permissions',
            (SELECT user_id FROM current_user_id),
            0,
            '{"mimetype": "text/plain"}'
        );
        RAISE NOTICE 'Successfully created test object';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create test object: %', SQLERRM;
    END;
END $$;

-- Verify that the policies were created
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
        policyname LIKE '%Restaurant Icons%'
    );

-- Drop the temporary table
DROP TABLE IF EXISTS current_user_id; 