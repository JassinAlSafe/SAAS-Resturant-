-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own business profile associations" ON business_profile_users;
DROP POLICY IF EXISTS "Business owners and admins can insert users" ON business_profile_users;
DROP POLICY IF EXISTS "Business owners and admins can update users" ON business_profile_users;
DROP POLICY IF EXISTS "Business owners and admins can delete users" ON business_profile_users;
DROP POLICY IF EXISTS "Users can view business profiles they belong to" ON business_profiles;
DROP POLICY IF EXISTS "Owners can update their business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can create business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Owners can delete their business profiles" ON business_profiles;

-- Create fixed policies for business_profile_users
CREATE POLICY "View own associations"
ON business_profile_users FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = business_profile_users.business_profile_id 
        AND bu.user_id = auth.uid()
        AND bu.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Insert users"
ON business_profile_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = business_profile_users.business_profile_id 
        AND bu.user_id = auth.uid()
        AND bu.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Update users"
ON business_profile_users FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = business_profile_users.business_profile_id 
        AND bu.user_id = auth.uid()
        AND bu.role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = business_profile_users.business_profile_id 
        AND bu.user_id = auth.uid()
        AND bu.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Delete users"
ON business_profile_users FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = business_profile_users.business_profile_id 
        AND bu.user_id = auth.uid()
        AND bu.role IN ('owner', 'admin')
    )
);

-- Create fixed policies for business_profiles
CREATE POLICY "View profiles"
ON business_profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = id
        AND bu.user_id = auth.uid()
    )
);

CREATE POLICY "Create profiles"
ON business_profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Update profiles"
ON business_profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = id
        AND bu.user_id = auth.uid()
        AND bu.role = 'owner'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = id
        AND bu.user_id = auth.uid()
        AND bu.role = 'owner'
    )
);

CREATE POLICY "Delete profiles"
ON business_profiles FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM business_profile_users bu
        WHERE bu.business_profile_id = id
        AND bu.user_id = auth.uid()
        AND bu.role = 'owner'
    )
); 