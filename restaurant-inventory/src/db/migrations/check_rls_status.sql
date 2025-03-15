-- Check RLS Status for restaurant-icons bucket
-- This script helps diagnose issues with RLS policies without making any changes

-- Check if the restaurant-icons bucket exists
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'restaurant-icons'
    ) INTO bucket_exists;

    IF bucket_exists THEN
        RAISE NOTICE 'restaurant-icons bucket exists';
    ELSE
        RAISE NOTICE 'restaurant-icons bucket does NOT exist';
    END IF;
END $$;

-- Check if RLS is enabled
DO $$
DECLARE
    buckets_rls BOOLEAN;
    objects_rls BOOLEAN;
BEGIN
    SELECT relrowsecurity INTO buckets_rls
    FROM pg_class 
    WHERE relname = 'buckets' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');
    
    SELECT relrowsecurity INTO objects_rls
    FROM pg_class 
    WHERE relname = 'objects' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');
    
    IF buckets_rls THEN
        RAISE NOTICE 'RLS is enabled on storage.buckets';
    ELSE
        RAISE NOTICE 'RLS is NOT enabled on storage.buckets';
    END IF;
    
    IF objects_rls THEN
        RAISE NOTICE 'RLS is enabled on storage.objects';
    ELSE
        RAISE NOTICE 'RLS is NOT enabled on storage.objects';
    END IF;
END $$;

-- List all policies for restaurant-icons bucket
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
        policyname LIKE '%restaurant-icons%' OR
        policyname LIKE '%restaurant_icons%' OR
        qual::text LIKE '%restaurant-icons%' OR
        with_check::text LIKE '%restaurant-icons%'
    )
ORDER BY
    tablename,
    cmd;

-- Check permissions for authenticated role
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM
    information_schema.role_table_grants
WHERE
    table_schema = 'storage'
    AND table_name IN ('buckets', 'objects')
    AND grantee = 'authenticated'
ORDER BY
    table_name,
    privilege_type;

-- Check if authenticated role exists
DO $$
DECLARE
    role_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'
    ) INTO role_exists;

    IF role_exists THEN
        RAISE NOTICE 'authenticated role exists';
    ELSE
        RAISE NOTICE 'authenticated role does NOT exist';
    END IF;
END $$;

-- Check if current user can access the bucket
DO $$
DECLARE
    current_user_id TEXT;
    can_access BOOLEAN;
BEGIN
    -- Get the current user ID
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'No authenticated user found - run this query while authenticated';
    ELSE
        RAISE NOTICE 'Current user ID: %', current_user_id;
        
        -- Check if user can access the bucket
        SELECT EXISTS (
            SELECT 1 FROM storage.buckets
            WHERE name = 'restaurant-icons'
        ) INTO can_access;
        
        IF can_access THEN
            RAISE NOTICE 'User can access the restaurant-icons bucket';
        ELSE
            RAISE NOTICE 'User CANNOT access the restaurant-icons bucket';
        END IF;
    END IF;
END $$;

-- Summary of findings
DO $$
BEGIN
    RAISE NOTICE '-----------------------------------------------';
    RAISE NOTICE 'RESTAURANT ICONS BUCKET RLS STATUS CHECK';
    RAISE NOTICE '-----------------------------------------------';
    RAISE NOTICE 'If you see any issues in the output above, run one of the fix scripts:';
    RAISE NOTICE '1. fix_restaurant_icons_rls.sql - Standard fix';
    RAISE NOTICE '2. fix_bucket_permissions.sql - Alternative fix';
    RAISE NOTICE '3. fix_restaurant_icons_final.sql - Comprehensive fix (recommended)';
    RAISE NOTICE '';
    RAISE NOTICE 'See README_STORAGE_RLS.md for more information.';
END $$; 