-- Ensure RLS is enabled on the main tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profile_users ENABLE ROW LEVEL SECURITY;

-- Create profile creation function that bypasses RLS 
CREATE OR REPLACE FUNCTION create_business_profile_with_user(
    p_user_id UUID,
    p_name TEXT,
    p_type TEXT,
    p_operating_hours JSONB,
    p_default_currency TEXT,
    p_tax_enabled BOOLEAN DEFAULT FALSE,
    p_tax_rate NUMERIC DEFAULT 0,
    p_tax_name TEXT DEFAULT 'Sales Tax'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
    v_result JSONB;
BEGIN
    -- Check that user is authenticated
    IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'User must be authenticated and can only create a profile for themselves';
    END IF;

    -- Create the business profile
    INSERT INTO business_profiles (
        user_id, 
        name, 
        type, 
        operating_hours, 
        default_currency,
        tax_enabled,
        tax_rate,
        tax_name
    ) VALUES (
        p_user_id,
        p_name,
        p_type,
        p_operating_hours,
        p_default_currency,
        p_tax_enabled,
        p_tax_rate,
        p_tax_name
    )
    RETURNING id INTO v_profile_id;

    -- Create the owner relationship
    INSERT INTO business_profile_users (
        user_id,
        business_profile_id,
        role
    ) VALUES (
        p_user_id,
        v_profile_id,
        'owner'
    );

    -- Return the created profile
    SELECT row_to_json(p)::jsonb INTO v_result 
    FROM business_profiles p 
    WHERE id = v_profile_id;

    RETURN v_result;
END;
$$;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can create their own business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can delete their own business profiles" ON business_profiles;

DROP POLICY IF EXISTS "Users can view their business profile associations" ON business_profile_users;
DROP POLICY IF EXISTS "Users can create their business profile associations" ON business_profile_users;
DROP POLICY IF EXISTS "Owners can update business profile associations" ON business_profile_users;
DROP POLICY IF EXISTS "Owners can delete business profile associations" ON business_profile_users;

-- Create policies for business_profiles
-- 1. View policy - users can view profiles they are associated with
CREATE POLICY "Users can view their own business profiles" 
ON business_profiles 
FOR SELECT 
USING (
    user_id = auth.uid() OR 
    id IN (
        SELECT business_profile_id 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
    )
);

-- 2. Insert policy - users can create profiles for themselves
CREATE POLICY "Users can create their own business profiles" 
ON business_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 3. Update policy - owners or the creator can update
CREATE POLICY "Users can update their own business profiles" 
ON business_profiles 
FOR UPDATE 
USING (
    user_id = auth.uid() OR 
    id IN (
        SELECT business_profile_id 
        FROM business_profile_users 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- 4. Delete policy - only owners can delete
CREATE POLICY "Users can delete their own business profiles" 
ON business_profiles 
FOR DELETE 
USING (
    user_id = auth.uid() OR 
    id IN (
        SELECT business_profile_id 
        FROM business_profile_users 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- Create policies for business_profile_users
-- 1. View policy - users can view their own associations
CREATE POLICY "Users can view their business profile associations" 
ON business_profile_users 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Insert policy - owners can add new users
CREATE POLICY "Users can create their business profile associations" 
ON business_profile_users 
FOR INSERT 
WITH CHECK (
    -- User can only add themselves initially
    (NEW.user_id = auth.uid() AND NEW.role = 'owner') OR
    -- Or they're already an owner of this business profile (checked using subquery)
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
        AND role = 'owner'
        AND business_profile_id = NEW.business_profile_id
    )
);

-- 3. Update policy - only owners can change roles
CREATE POLICY "Owners can update business profile associations" 
ON business_profile_users 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
        AND role = 'owner'
        AND business_profile_id = OLD.business_profile_id
    )
);

-- 4. Delete policy - only owners can remove users
CREATE POLICY "Owners can delete business profile associations" 
ON business_profile_users 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 
        FROM business_profile_users 
        WHERE user_id = auth.uid()
        AND role = 'owner'
        AND business_profile_id = OLD.business_profile_id
    )
);

-- Create a trigger function to clean up multiple owner profiles if needed
CREATE OR REPLACE FUNCTION clean_duplicate_profiles()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new profile creation, check for existing ones and maybe clean up
    IF TG_OP = 'INSERT' THEN
        -- Keep only the most recent profile for this user if there are duplicates
        WITH duplicates AS (
            SELECT id
            FROM business_profiles
            WHERE user_id = NEW.user_id
            ORDER BY created_at DESC
            OFFSET 1  -- Skip the most recent one
        )
        DELETE FROM business_profiles
        WHERE id IN (SELECT id FROM duplicates);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS clean_duplicate_profiles_trigger ON business_profiles;
CREATE TRIGGER clean_duplicate_profiles_trigger
AFTER INSERT ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION clean_duplicate_profiles(); 