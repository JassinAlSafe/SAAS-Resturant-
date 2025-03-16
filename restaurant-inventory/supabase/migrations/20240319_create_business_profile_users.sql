-- Create business_profile_users table for managing user-business relationships
CREATE TABLE IF NOT EXISTS business_profile_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_profile_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_profile_users_user_id ON business_profile_users(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profile_users_business_profile_id ON business_profile_users(business_profile_id);

-- Enable Row Level Security
ALTER TABLE business_profile_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_profile_users
CREATE POLICY "Users can view their own business profile associations"
ON business_profile_users FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id OR
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = business_profile_users.business_profile_id 
        AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Business owners and admins can insert users"
ON business_profile_users FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = business_profile_users.business_profile_id 
        AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Business owners and admins can update users"
ON business_profile_users FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = business_profile_users.business_profile_id 
        AND role IN ('owner', 'admin')
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = business_profile_users.business_profile_id 
        AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Business owners and admins can delete users"
ON business_profile_users FOR DELETE
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = business_profile_users.business_profile_id 
        AND role IN ('owner', 'admin')
    )
);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_profile_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_business_profile_users_updated_at_trigger
    BEFORE UPDATE ON business_profile_users
    FOR EACH ROW
    EXECUTE FUNCTION update_business_profile_users_updated_at();

-- Create function to automatically add business owner when a business profile is created
CREATE OR REPLACE FUNCTION add_business_owner_on_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO business_profile_users (user_id, business_profile_id, role)
    VALUES (NEW.user_id, NEW.id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add business owner
CREATE TRIGGER add_business_owner_trigger
    AFTER INSERT ON business_profiles
    FOR EACH ROW
    EXECUTE FUNCTION add_business_owner_on_profile_creation(); 