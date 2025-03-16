-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow the service role to manage all profiles
CREATE POLICY "Service role can manage all profiles"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Update the profiles table to ensure created_at and updated_at are set
ALTER TABLE profiles 
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 