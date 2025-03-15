-- Migration: 20240315_settings_tables.sql
-- Description: Create tables for user settings (theme and notifications)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create RLS policies for theme_settings
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

-- Create trigger to update the updated_at timestamp for theme_settings
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

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  order_updates BOOLEAN DEFAULT TRUE,
  inventory_alerts BOOLEAN DEFAULT TRUE,
  security_alerts BOOLEAN DEFAULT TRUE,
  billing_notifications BOOLEAN DEFAULT TRUE,
  quiet_hours_start VARCHAR(5) DEFAULT '22:00',
  quiet_hours_end VARCHAR(5) DEFAULT '07:00',
  frequency VARCHAR(10) DEFAULT 'immediate',
  digest_time VARCHAR(5) DEFAULT '09:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx ON notification_preferences(user_id);

-- Create RLS policies for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own notification preferences
CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to insert their own notification preferences
CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update the updated_at timestamp for notification_preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at();

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

-- Enable Row Level Security for business_profiles
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

-- Create trigger to update the updated_at timestamp for business_profiles
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