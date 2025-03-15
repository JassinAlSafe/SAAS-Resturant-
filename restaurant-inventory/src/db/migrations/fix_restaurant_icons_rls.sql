-- Fix RLS policies for restaurant-icons storage bucket
-- This script addresses the 400 error when accessing the restaurant-icons bucket

-- First, check if the storage schema and bucket exist
DO $$
BEGIN
    -- Create the restaurant-icons bucket if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'restaurant-icons'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('restaurant-icons', 'restaurant-icons', false);
        
        RAISE NOTICE 'Created restaurant-icons bucket';
    ELSE
        RAISE NOTICE 'restaurant-icons bucket already exists';
    END IF;
END $$;

-- Enable RLS on the buckets table
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to restaurant-icons" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to restaurant-icons" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own restaurant icons" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own restaurant icons" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to access restaurant-icons bucket" ON storage.buckets;

-- Create policy to allow users to access the restaurant-icons bucket
CREATE POLICY "Allow users to access restaurant-icons bucket"
ON storage.buckets
FOR SELECT
TO authenticated
USING (name = 'restaurant-icons');

-- Create policy to allow public read access to restaurant-icons
CREATE POLICY "Allow public read access to restaurant-icons"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'restaurant-icons');

-- Create policy to allow authenticated users to upload to restaurant-icons
CREATE POLICY "Allow authenticated users to upload to restaurant-icons"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'restaurant-icons');

-- Create policy to allow users to update their own restaurant icons
CREATE POLICY "Allow users to update their own restaurant icons"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'restaurant-icons');

-- Create policy to allow users to delete their own restaurant icons
CREATE POLICY "Allow users to delete their own restaurant icons"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'restaurant-icons');

-- Create a function to get policies for a bucket
CREATE OR REPLACE FUNCTION get_policies_for_bucket(bucket_name TEXT)
RETURNS TABLE (
    name TEXT,
    operation TEXT,
    definition TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.policyname::TEXT AS name,
        p.cmd::TEXT AS operation,
        COALESCE(p.qual::TEXT, '') || CASE WHEN p.with_check IS NOT NULL THEN ' WITH CHECK ' || p.with_check::TEXT ELSE '' END AS definition
    FROM 
        pg_policies p
    WHERE 
        p.schemaname = 'storage' AND
        (
            (p.tablename = 'buckets' AND p.qual::TEXT LIKE '%' || bucket_name || '%') OR
            (p.tablename = 'objects' AND p.qual::TEXT LIKE '%' || bucket_name || '%')
        );
END;
$$ LANGUAGE plpgsql;

-- Grant usage on the storage schema to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Grant select on buckets to authenticated users
GRANT SELECT ON storage.buckets TO authenticated;

-- Grant all on objects to authenticated users
GRANT ALL ON storage.objects TO authenticated;

-- Add additional permissions that might be needed
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

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
    AND policyname LIKE '%restaurant-icons%'; 