-- Add business_profile_id column to suppliers table if it doesn't exist
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS business_profile_id UUID REFERENCES business_profiles(id);

-- Create a function to get the first business profile ID for each user
CREATE OR REPLACE FUNCTION get_first_business_profile_id(user_id UUID) 
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    SELECT business_profile_id INTO profile_id
    FROM business_profile_users
    WHERE user_id = user_id
    LIMIT 1;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing suppliers with business_profile_id from the first business profile
-- This assumes that the current user is the owner of all existing suppliers
DO $$
DECLARE
    current_user_id UUID;
    first_profile_id UUID;
BEGIN
    -- Get the current authenticated user ID (this will need to be replaced with the actual user ID)
    -- In production, you would need to run this script for each user or have a more sophisticated approach
    SELECT auth.uid() INTO current_user_id;
    
    -- Get the first business profile ID for the current user
    SELECT business_profile_id INTO first_profile_id
    FROM business_profile_users
    WHERE user_id = current_user_id
    LIMIT 1;
    
    -- Update all suppliers that don't have a business_profile_id
    UPDATE suppliers
    SET business_profile_id = first_profile_id
    WHERE business_profile_id IS NULL;
    
    RAISE NOTICE 'Updated suppliers with business_profile_id: %', first_profile_id;
END $$;

-- Add RLS policy to suppliers table
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert their suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their suppliers" ON suppliers;

-- Create policies for suppliers table
CREATE POLICY "Users can view their suppliers" ON suppliers
    FOR SELECT
    USING (
        business_profile_id IN (
            SELECT business_profile_id
            FROM business_profile_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their suppliers" ON suppliers
    FOR INSERT
    WITH CHECK (
        business_profile_id IN (
            SELECT business_profile_id
            FROM business_profile_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their suppliers" ON suppliers
    FOR UPDATE
    USING (
        business_profile_id IN (
            SELECT business_profile_id
            FROM business_profile_users
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        business_profile_id IN (
            SELECT business_profile_id
            FROM business_profile_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their suppliers" ON suppliers
    FOR DELETE
    USING (
        business_profile_id IN (
            SELECT business_profile_id
            FROM business_profile_users
            WHERE user_id = auth.uid()
        )
    ); 