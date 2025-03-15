# Storage RLS Policies for Restaurant Inventory App

This document explains how to fix Row-Level Security (RLS) policy issues with the Supabase storage buckets used in the Restaurant Inventory application.

## Common RLS Error

If you encounter an error like this:

```
Error: Row-Level Security Policy Error
Details: The operation was blocked by Supabase RLS policies.
```

This means that the current user doesn't have permission to perform the requested operation on the storage bucket.

## Diagnosing the Issue

Before applying any fixes, you can diagnose the current state of your RLS policies:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `check_rls_status.sql` file
5. Run the query

This diagnostic script will:

- Check if the bucket exists
- Verify if RLS is enabled on the relevant tables
- List all existing policies for the bucket
- Check permissions for the authenticated role
- Verify if the authenticated role exists
- Test if the current user can access the bucket
- Provide a summary of findings and recommended next steps

Based on the results, you can choose the appropriate fix from the options below.

## Testing the API Route

If you're experiencing issues with the API route that sets up the bucket, you can test it directly:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `test_api_route.sql` file
5. Run the query

This script will:

- Check if the required function exists and create it if needed
- Test if the current user can access the bucket
- Attempt to create a test folder to verify permissions
- Provide detailed error messages if any issues are found

## Solution 1: Fix Restaurant Icons Bucket with Standard Script

To fix RLS policy issues with the `restaurant-icons` bucket, follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `fix_restaurant_icons_rls.sql` file
5. Run the query

The SQL script will:

- Create the `restaurant-icons` bucket if it doesn't exist
- Enable Row Level Security on the storage tables
- Drop any existing policies for the bucket
- Create new policies that allow:
  - Authenticated users to access the bucket
  - Authenticated users to read objects in the bucket
  - Authenticated users to upload, update, and delete objects in the bucket
- Create a helper function to check policies
- Grant necessary permissions to authenticated users

## Solution 2: Alternative Direct Fix

If Solution 1 doesn't work, try the alternative approach:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `fix_bucket_permissions.sql` file
5. Run the query

This alternative script:

- Uses a different naming convention for policies
- Dynamically drops all existing policies related to the bucket
- Creates new policies with explicit roles
- Attempts to create a test object to verify permissions
- Provides more detailed error reporting

## Solution 3: Comprehensive Final Fix (Recommended)

If you're still experiencing issues, or want the most robust solution, use the final fix script:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `fix_restaurant_icons_final.sql` file
5. Run the query

This comprehensive script:

- Combines the best approaches from both previous solutions
- Drops ALL existing policies using multiple detection methods
- Creates policies with proper user-specific permissions
- Ensures users can only access their own files
- Includes a test that verifies the policies work correctly
- Provides detailed output and error reporting
- Updates the helper function with more comprehensive information

## Solution 4: Emergency Fix (Last Resort)

If none of the above solutions work, you can use the emergency fix as a last resort:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `emergency_fix.sql` file
5. Run the query

This emergency script:

- Temporarily sets the role to postgres (superuser)
- Drops ALL existing policies on storage tables
- Creates maximally permissive policies that allow all operations
- Grants ALL permissions to the authenticated role
- Tests the setup with a hardcoded test user

**Note:** This is a temporary solution to get your application working. Once confirmed working, you should apply one of the more secure solutions above.

## Testing the Fix

After running any of the SQL scripts, you can test if the fix worked by:

1. Refreshing the application
2. Going to the Business Profile settings
3. Trying to upload a logo image

If the upload works without errors, the RLS policies have been fixed successfully.

## Manual Verification

You can manually verify the policies by running this SQL query in the Supabase SQL Editor:

```sql
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
        policyname LIKE '%restaurant_icons%'
    );
```

This will show all policies related to the `restaurant-icons` bucket.

## Common Issues and Solutions

### 1. Incorrect Roles

If you see policies with `roles = {public}` instead of `roles = {authenticated}`, this is likely the issue. The fix scripts should correct this by explicitly setting the role to `authenticated`.

### 2. Missing Permissions

Sometimes the authenticated role needs additional permissions. The fix scripts grant:

- `USAGE ON SCHEMA storage`
- `SELECT ON storage.buckets`
- `ALL ON storage.objects`
- `USAGE ON SCHEMA auth`
- `SELECT ON auth.users`

### 3. Bucket Doesn't Exist

If the bucket doesn't exist, the fix scripts will create it automatically.

### 4. Conflicting Policies

If you have multiple policies with different naming conventions, they might conflict with each other. The comprehensive final fix script addresses this by dropping all policies before creating new ones.

### 5. API Route Issues

If the API route is failing but direct SQL operations work, there might be an issue with how the API is interacting with Supabase. The `test_api_route.sql` script can help diagnose these issues.

## Troubleshooting

If you still encounter issues after running the fix:

1. Check if the bucket exists:

   ```sql
   SELECT * FROM storage.buckets WHERE name = 'restaurant-icons';
   ```

2. Verify that RLS is enabled:

   ```sql
   SELECT relname, relrowsecurity FROM pg_class
   WHERE relname IN ('buckets', 'objects')
   AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');
   ```

3. Check if your user has the 'authenticated' role:

   ```sql
   SELECT rolname FROM pg_roles WHERE rolname = 'authenticated';
   ```

4. Ensure the authenticated role has the necessary permissions:

   ```sql
   SELECT grantee, privilege_type
   FROM information_schema.role_table_grants
   WHERE table_schema = 'storage'
   AND table_name IN ('buckets', 'objects')
   AND grantee = 'authenticated';
   ```

5. Try creating a test object directly in SQL:
   ```sql
   INSERT INTO storage.objects (bucket_id, name, owner, size, metadata)
   VALUES (
       'restaurant-icons',
       auth.uid() || '/.test_permissions',
       auth.uid(),
       0,
       '{"mimetype": "text/plain"}'
   );
   ```

If problems persist, you may need to contact Supabase support or check the Supabase documentation for more information on storage permissions.
