-- Drop the unique constraint on user_id
ALTER TABLE business_profiles DROP CONSTRAINT IF EXISTS business_profiles_user_id_key;

-- Add new columns for multi-user support
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5;

-- Migrate existing business profiles to the new business_profile_users table
DO $$
DECLARE
    profile RECORD;
BEGIN
    -- For each existing business profile
    FOR profile IN SELECT id, user_id FROM business_profiles WHERE user_id IS NOT NULL
    LOOP
        -- Insert the user as an owner in the business_profile_users table
        -- Only insert if it doesn't already exist
        INSERT INTO business_profile_users (user_id, business_profile_id, role)
        VALUES (profile.user_id, profile.id, 'owner')
        ON CONFLICT (user_id, business_profile_id) DO NOTHING;
    END LOOP;
END $$;

-- Update RLS policies for business_profiles
DROP POLICY IF EXISTS "Users can view their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can insert their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can delete their own business profile" ON business_profiles;

-- Create new RLS policies that work with business_profile_users
CREATE POLICY "Users can view business profiles they belong to"
ON business_profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM business_profile_users
        WHERE business_profile_id = id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Owners can update their business profiles"
ON business_profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM business_profile_users
        WHERE business_profile_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM business_profile_users
        WHERE business_profile_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
);

CREATE POLICY "Users can create business profiles"
ON business_profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Owners can delete their business profiles"
ON business_profiles FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM business_profile_users
        WHERE business_profile_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
); 