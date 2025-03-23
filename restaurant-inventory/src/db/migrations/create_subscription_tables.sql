-- Make sure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First check if the subscriptions table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        -- Create the subscriptions table
        CREATE TABLE public.subscriptions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            business_profile_id UUID NOT NULL,
            stripe_subscription_id TEXT UNIQUE NOT NULL,
            stripe_customer_id TEXT NOT NULL,
            stripe_price_id TEXT NOT NULL,
            plan_name TEXT NOT NULL,
            status TEXT NOT NULL,
            current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
            current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
            cancel_at_period_end BOOLEAN DEFAULT FALSE,
            canceled_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- If the table exists but the column doesn't, add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'subscriptions' 
                      AND column_name = 'business_profile_id') THEN
            ALTER TABLE public.subscriptions ADD COLUMN business_profile_id UUID NOT NULL;
        END IF;
    END IF;
END
$$;

-- Add foreign key constraint separately (after table creation)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_business_profile_id_fkey'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT subscriptions_business_profile_id_fkey 
        FOREIGN KEY (business_profile_id) 
        REFERENCES public.business_profiles(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_business_profile_id ON public.subscriptions(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Add subscription columns to business_profiles table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_profiles' 
                  AND column_name = 'subscription_plan') THEN
        ALTER TABLE public.business_profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_profiles' 
                  AND column_name = 'subscription_status') THEN
        ALTER TABLE public.business_profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_profiles' 
                  AND column_name = 'subscription_id') THEN
        ALTER TABLE public.business_profiles ADD COLUMN subscription_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_profiles' 
                  AND column_name = 'subscription_price_id') THEN
        ALTER TABLE public.business_profiles ADD COLUMN subscription_price_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_profiles' 
                  AND column_name = 'subscription_product_id') THEN
        ALTER TABLE public.business_profiles ADD COLUMN subscription_product_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_profiles' 
                  AND column_name = 'subscription_current_period_end') THEN
        ALTER TABLE public.business_profiles ADD COLUMN subscription_current_period_end TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_profiles' 
                  AND column_name = 'max_users') THEN
        ALTER TABLE public.business_profiles ADD COLUMN max_users INTEGER DEFAULT 1;
    END IF;
END
$$;

-- First check if the billing_history table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_history') THEN
        -- Create billing_history table
        CREATE TABLE public.billing_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            business_profile_id UUID NOT NULL,
            stripe_invoice_id TEXT UNIQUE,
            stripe_payment_intent_id TEXT,
            amount NUMERIC NOT NULL,
            currency TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT,
            invoice_pdf_url TEXT,
            invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- If the table exists but the column doesn't, add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'billing_history' 
                      AND column_name = 'business_profile_id') THEN
            ALTER TABLE public.billing_history ADD COLUMN business_profile_id UUID NOT NULL;
        END IF;
    END IF;
END
$$;

-- Add foreign key constraint for billing_history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'billing_history_business_profile_id_fkey'
    ) THEN
        ALTER TABLE public.billing_history 
        ADD CONSTRAINT billing_history_business_profile_id_fkey 
        FOREIGN KEY (business_profile_id) 
        REFERENCES public.business_profiles(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Create index for billing history
CREATE INDEX IF NOT EXISTS idx_billing_history_business_profile_id ON public.billing_history(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_stripe_invoice_id ON public.billing_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON public.billing_history(status);
