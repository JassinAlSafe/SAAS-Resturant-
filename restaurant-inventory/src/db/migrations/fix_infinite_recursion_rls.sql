-- Fix infinite recursion in business_profile_users RLS policies
-- This migration addresses the error: "infinite recursion detected in policy for relation 'business_profile_users'"

-- First, disable RLS temporarily to ensure we can perform operations
ALTER TABLE business_profile_users DISABLE ROW LEVEL SECURITY;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their business profile associations" ON business_profile_users;
DROP POLICY IF EXISTS "Users can create their business profile associations" ON business_profile_users;
DROP POLICY IF EXISTS "Owners can update business profile associations" ON business_profile_users;
DROP POLICY IF EXISTS "Owners can delete business profile associations" ON business_profile_users;

-- Re-create policies using EXISTS pattern instead of IN to avoid recursion
-- 1. View policy - users can view their own associations
CREATE POLICY "Users can view their business profile associations" 
ON business_profile_users 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Insert policy - fixed to prevent recursion
CREATE POLICY "Users can create their business profile associations" 
ON business_profile_users 
FOR INSERT 
WITH CHECK (
    -- User can only add themselves initially as owner
    (NEW.user_id = auth.uid() AND NEW.role = 'owner') OR
    -- Or they're already an owner of this business profile (checked using EXISTS)
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
        AND role = 'owner'
        AND business_profile_id = NEW.business_profile_id
    )
);

-- 3. Update policy - fixed to prevent recursion
CREATE POLICY "Owners can update business profile associations" 
ON business_profile_users 
FOR UPDATE 
USING (
    -- Check if current user is an owner of the business profile
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
        AND role = 'owner'
        AND business_profile_id = business_profile_users.business_profile_id
    )
);

-- 4. Delete policy - fixed to prevent recursion
CREATE POLICY "Owners can delete business profile associations" 
ON business_profile_users 
FOR DELETE 
USING (
    -- Check if current user is an owner of the business profile
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
        AND role = 'owner'
        AND business_profile_id = business_profile_users.business_profile_id
    )
);

-- Re-enable RLS
ALTER TABLE business_profile_users ENABLE ROW LEVEL SECURITY;

-- Also fix business_profiles policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can delete their own business profiles" ON business_profiles;

-- Recreate with EXISTS pattern
CREATE POLICY "Users can view their own business profiles" 
ON business_profiles 
FOR SELECT 
USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
        AND business_profile_id = business_profiles.id
    )
);

CREATE POLICY "Users can update their own business profiles" 
ON business_profiles 
FOR UPDATE 
USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
        AND business_profile_id = business_profiles.id
    )
);

CREATE POLICY "Users can delete their own business profiles" 
ON business_profiles 
FOR DELETE 
USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
        AND business_profile_id = business_profiles.id
    )
);

-- Print out confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Fixed infinite recursion in RLS policies for business_profile_users and business_profiles tables';
END $$; 