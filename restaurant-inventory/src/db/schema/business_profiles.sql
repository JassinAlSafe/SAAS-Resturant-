-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  type VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zipCode VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url TEXT,
  default_currency VARCHAR(10) DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_enabled BOOLEAN DEFAULT FALSE,
  tax_name VARCHAR(100) DEFAULT 'Tax',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS business_profiles_user_id_idx ON business_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own business profile
CREATE POLICY "Users can view their own business profile"
  ON business_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own business profile
CREATE POLICY "Users can insert their own business profile"
  ON business_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own business profile
CREATE POLICY "Users can update their own business profile"
  ON business_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own business profile
CREATE POLICY "Users can delete their own business profile"
  ON business_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_profiles_updated_at
BEFORE UPDATE ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION update_business_profiles_updated_at(); 