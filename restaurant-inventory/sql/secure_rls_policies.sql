-- Secure RLS policies for essential tables
-- Run this in your Supabase SQL Editor to properly secure your tables

-- Ensure RLS is enabled on key tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can insert their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can delete their own business profile" ON business_profiles;

-- Create secure policies for profiles table
-- SELECT own profile only
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- UPDATE own profile only
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT own profile only (using auth.uid() ensures users can only create profiles with their own ID)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create secure policies for business_profiles table
-- View own business profiles
CREATE POLICY "Users can view their own business profile"
ON business_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update own business profiles
CREATE POLICY "Users can update their own business profile"
ON business_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert own business profile
CREATE POLICY "Users can insert their own business profile"
ON business_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Delete own business profile
CREATE POLICY "Users can delete their own business profile"
ON business_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Optional: Admin policies if you're using admin roles
-- Example (un-comment if needed):
/*
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
*/

-- Verify the policies
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
  schemaname = 'public'
  AND tablename IN ('profiles', 'business_profiles'); 