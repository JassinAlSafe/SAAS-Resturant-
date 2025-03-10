-- Script to drop existing restaurant-icons policies
-- Run this first if you're having trouble with the other scripts

-- Drop the INSERT policy
BEGIN;
    DROP POLICY IF EXISTS "Allow authenticated users to upload restaurant icons" ON storage.objects;
COMMIT;

-- Drop the UPDATE policy
BEGIN;
    DROP POLICY IF EXISTS "Allow users to update their own restaurant icons" ON storage.objects;
COMMIT;

-- Drop the SELECT policy
BEGIN;
    DROP POLICY IF EXISTS "Allow users to select their own restaurant icons" ON storage.objects;
COMMIT;

-- Drop the DELETE policy
BEGIN;
    DROP POLICY IF EXISTS "Allow users to delete their own restaurant icons" ON storage.objects;
COMMIT;

-- Verify policies were dropped
SELECT 
    policyname, 
    tablename, 
    permissive, 
    roles, 
    cmd, 
    CASE WHEN using_expr IS NOT NULL THEN 'USING' ELSE '' END as using_clause,
    CASE WHEN with_check_expr IS NOT NULL THEN 'WITH CHECK' ELSE '' END as with_check_clause
FROM 
    pg_policies 
WHERE 
    tablename = 'objects' 
    AND schemaname = 'storage'
    AND (using_expr::text LIKE '%restaurant-icons%' OR with_check_expr::text LIKE '%restaurant-icons%'); 