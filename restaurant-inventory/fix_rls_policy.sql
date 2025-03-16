-- Drop existing policies on business_profile_users table that might be causing recursion
DROP POLICY IF EXISTS "Delete users" ON business_profile_users;
DROP POLICY IF EXISTS "Insert users" ON business_profile_users;
DROP POLICY IF EXISTS "Update users" ON business_profile_users;
DROP POLICY IF EXISTS "View own associations" ON business_profile_users;

-- Create simpler policies for business_profile_users
CREATE POLICY "View own associations" 
ON business_profile_users
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Insert own associations" 
ON business_profile_users
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own associations" 
ON business_profile_users
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own associations" 
ON business_profile_users
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing policies on business_profiles table that might be causing recursion
DROP POLICY IF EXISTS "Create profiles" ON business_profiles;
DROP POLICY IF EXISTS "Delete profiles" ON business_profiles;
DROP POLICY IF EXISTS "Update profiles" ON business_profiles;
DROP POLICY IF EXISTS "View profiles" ON business_profiles;

-- Create simpler policies for business_profiles
CREATE POLICY "Create own profiles" 
ON business_profiles
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View own profiles" 
ON business_profiles
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Update own profiles" 
ON business_profiles
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own profiles" 
ON business_profiles
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for viewing associated business profiles
CREATE POLICY "View associated profiles" 
ON business_profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM business_profile_users
    WHERE business_profile_users.business_profile_id = business_profiles.id
    AND business_profile_users.user_id = auth.uid()
  )
);

-- Ensure RLS is enabled on both tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profile_users ENABLE ROW LEVEL SECURITY; 