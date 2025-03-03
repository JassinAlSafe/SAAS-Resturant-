-- SQL for creating the business_profiles table in Supabase if it doesn't exist

CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo TEXT,
    operating_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "closed": false},
        "friday": {"open": "09:00", "close": "17:00", "closed": false},
        "saturday": {"open": "10:00", "close": "15:00", "closed": false},
        "sunday": {"open": "10:00", "close": "15:00", "closed": true}
    }'::jsonb,
    default_currency TEXT DEFAULT 'SEK',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);

-- Row Level Security Policies
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update only their own business profile
CREATE POLICY business_profile_policy ON public.business_profiles
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 