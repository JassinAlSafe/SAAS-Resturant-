-- This script updates existing policies instead of creating new ones
-- Use this if you're getting "policy already exists" errors

-- Update the INSERT policy
ALTER POLICY "Allow authenticated users to upload restaurant icons"
ON storage.objects
WITH CHECK (
    bucket_id = 'restaurant-icons' 
    AND auth.role() = 'authenticated'
);

-- Update the UPDATE policy
ALTER POLICY "Allow users to update their own restaurant icons"
ON storage.objects
USING (
    bucket_id = 'restaurant-icons' 
    AND owner = auth.uid()
);

-- Update the SELECT policy
ALTER POLICY "Allow users to select their own restaurant icons"
ON storage.objects
USING (
    bucket_id = 'restaurant-icons' 
    AND owner = auth.uid()
);

-- Update the DELETE policy
ALTER POLICY "Allow users to delete their own restaurant icons"
ON storage.objects
USING (
    bucket_id = 'restaurant-icons' 
    AND owner = auth.uid()
);

-- Verify that the policies exist with the correct conditions
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