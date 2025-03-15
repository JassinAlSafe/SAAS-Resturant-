-- Create theme_settings table
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  font_size VARCHAR(10) DEFAULT 'medium',
  compact_mode BOOLEAN DEFAULT FALSE,
  sticky_header BOOLEAN DEFAULT TRUE,
  animations BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS theme_settings_user_id_idx ON theme_settings(user_id);

-- Create RLS policies
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own theme settings
CREATE POLICY "Users can view their own theme settings"
  ON theme_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own theme settings
CREATE POLICY "Users can update their own theme settings"
  ON theme_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to insert their own theme settings
CREATE POLICY "Users can insert their own theme settings"
  ON theme_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_theme_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_settings_updated_at
BEFORE UPDATE ON theme_settings
FOR EACH ROW
EXECUTE FUNCTION update_theme_settings_updated_at(); 