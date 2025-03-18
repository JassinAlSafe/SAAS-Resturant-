-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON business_profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON business_profiles;
DROP POLICY IF EXISTS "Enable update access for profile owners" ON business_profiles;
DROP POLICY IF EXISTS "Enable delete access for profile owners" ON business_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON business_profile_users;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON business_profile_users;
DROP POLICY IF EXISTS "Enable update access for profile owners" ON business_profile_users;
DROP POLICY IF EXISTS "Enable delete access for profile owners" ON business_profile_users;

-- Drop the view if it exists
DROP VIEW IF EXISTS profiles_api;

-- Enable RLS on both tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profile_users ENABLE ROW LEVEL SECURITY;

-- Create a simplified view for profile access
CREATE OR REPLACE VIEW profiles_api AS
SELECT bp.*
FROM business_profiles bp;

-- Grant access to the view
GRANT SELECT ON profiles_api TO authenticated;

-- Create policies for business_profiles

-- Read policy: Users can read profiles they own or are members of
CREATE POLICY "Enable read access for profile members" ON business_profiles
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM business_profile_users 
        WHERE business_profile_id = business_profiles.id 
        AND user_id = auth.uid()
    )
);

-- Insert policy: Users can create their own profiles
CREATE POLICY "Enable insert for own profiles" ON business_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policy: Users can update profiles they own or manage
CREATE POLICY "Enable update for profile owners and managers" ON business_profiles
FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM business_profile_users 
        WHERE business_profile_id = business_profiles.id 
        AND user_id = auth.uid() 
        AND role = 'manager'
    )
);

-- Delete policy: Only profile owners can delete
CREATE POLICY "Enable delete for profile owners" ON business_profiles
FOR DELETE USING (auth.uid() = user_id);

-- Create policies for business_profile_users

-- Read policy: Users can read entries they're part of or own the profile
CREATE POLICY "Enable read access for profile members" ON business_profile_users
FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM business_profiles 
        WHERE id = business_profile_users.business_profile_id 
        AND user_id = auth.uid()
    )
);

-- Insert policy: Profile owners can add users
CREATE POLICY "Enable insert for profile owners" ON business_profile_users
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM business_profiles 
        WHERE id = business_profile_id 
        AND user_id = auth.uid()
    )
);

-- Update policy: Profile owners can update user roles
CREATE POLICY "Enable update for profile owners" ON business_profile_users
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM business_profiles 
        WHERE id = business_profile_id 
        AND user_id = auth.uid()
    )
);

-- Delete policy: Profile owners can remove users
CREATE POLICY "Enable delete for profile owners" ON business_profile_users
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM business_profiles 
        WHERE id = business_profile_id 
        AND user_id = auth.uid()
    )
); 