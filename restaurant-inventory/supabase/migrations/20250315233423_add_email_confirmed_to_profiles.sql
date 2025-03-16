-- Add email_confirmed column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;

-- Add tax_enabled, tax_rate, and tax_name columns to business_profiles table
ALTER TABLE public.business_profiles
ADD COLUMN IF NOT EXISTS tax_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_name VARCHAR DEFAULT 'Sales Tax';

-- Comment on the columns
COMMENT ON COLUMN public.profiles.email_confirmed IS 'Whether the user has confirmed their email address';
COMMENT ON COLUMN public.business_profiles.tax_enabled IS 'Whether tax is enabled for this business';
COMMENT ON COLUMN public.business_profiles.tax_rate IS 'The tax rate for this business';
COMMENT ON COLUMN public.business_profiles.tax_name IS 'The name of the tax for this business';
