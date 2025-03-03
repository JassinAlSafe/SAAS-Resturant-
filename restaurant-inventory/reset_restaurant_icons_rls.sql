-- Complete reset and setup of RLS policies for restaurant-icons bucket
-- This script will:
-- 1. Drop all existing policies
-- 2. Create the trigger function to set the owner field
-- 3. Create new policies with the correct conditions

-- First, drop all existing policies for the restaurant-icons bucket
DO $$
BEGIN
    -- Drop INSERT policy
    BEGIN
        DROP POLICY IF EXISTS "Allow authenticated users to upload restaurant icons" ON storage.objects;
        RAISE NOTICE 'Dropped INSERT policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping INSERT policy: %', SQLERRM;
    END;

    -- Drop UPDATE policy
    BEGIN
        DROP POLICY IF EXISTS "Allow users to update their own restaurant icons" ON storage.objects;
        RAISE NOTICE 'Dropped UPDATE policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping UPDATE policy: %', SQLERRM;
    END;

    -- Drop SELECT policy
    BEGIN
        DROP POLICY IF EXISTS "Allow users to select their own restaurant icons" ON storage.objects;
        RAISE NOTICE 'Dropped SELECT policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping SELECT policy: %', SQLERRM;
    END;

    -- Drop DELETE policy
    BEGIN
        DROP POLICY IF EXISTS "Allow users to delete their own restaurant icons" ON storage.objects;
        RAISE NOTICE 'Dropped DELETE policy';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping DELETE policy: %', SQLERRM;
    END;
END $$;

-- Next, create or replace the trigger function to set the owner field
CREATE OR REPLACE FUNCTION storage.storage_objects_set_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bucket_id = 'restaurant-icons' THEN
        NEW.owner = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS set_restaurant_icons_owner ON storage.objects;

-- Create the trigger to automatically set the owner field
CREATE TRIGGER set_restaurant_icons_owner
BEFORE INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'restaurant-icons')
EXECUTE FUNCTION storage.storage_objects_set_owner();

-- Ensure the bucket exists with proper configuration
DO $$
BEGIN
    -- Check if bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'restaurant-icons') THEN
        -- Create the bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'restaurant-icons',
            'Restaurant Icons',
            false,
            5242880, -- 5MB
            ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']::text[]
        );
        RAISE NOTICE 'Created restaurant-icons bucket';
    ELSE
        RAISE NOTICE 'restaurant-icons bucket already exists';
    END IF;
END $$;

-- Now create the policies with proper owner checks
-- INSERT policy - Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload restaurant icons"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'restaurant-icons' 
    AND auth.role() = 'authenticated'
);

-- UPDATE policy - Allow users to update only their own files
CREATE POLICY "Allow users to update their own restaurant icons"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'restaurant-icons' 
    AND owner = auth.uid()
);

-- SELECT policy - Allow users to select only their own files
CREATE POLICY "Allow users to select their own restaurant icons"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'restaurant-icons' 
    AND owner = auth.uid()
);

-- DELETE policy - Allow users to delete only their own files
CREATE POLICY "Allow users to delete their own restaurant icons"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'restaurant-icons' 
    AND owner = auth.uid()
);

-- Verify that the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_schema, 
    event_object_table, 
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'set_restaurant_icons_owner';

-- Verify that the policies exist
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies
WHERE tablename = 'objects' 
AND policyname LIKE '%restaurant icons%'; 