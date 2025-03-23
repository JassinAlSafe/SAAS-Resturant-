-- Add business_profile_id column to subscriptions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'subscriptions' 
                  AND column_name = 'business_profile_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN business_profile_id UUID;
    END IF;
END
$$;

-- Add stripe_customer_id column to subscriptions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'subscriptions' 
                  AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN stripe_customer_id TEXT;
    END IF;
END
$$;

-- Add stripe_price_id column to subscriptions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'subscriptions' 
                  AND column_name = 'stripe_price_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN stripe_price_id TEXT;
    END IF;
END
$$;

-- Add plan_name column to subscriptions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'subscriptions' 
                  AND column_name = 'plan_name') THEN
        ALTER TABLE public.subscriptions ADD COLUMN plan_name TEXT;
    END IF;
END
$$;

-- Add canceled_at column to subscriptions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'subscriptions' 
                  AND column_name = 'canceled_at') THEN
        ALTER TABLE public.subscriptions ADD COLUMN canceled_at TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

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

-- Create billing_history table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_history') THEN
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
    END IF;
END
$$;

-- Create indexes for faster lookups if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_business_profile_id') THEN
        CREATE INDEX idx_subscriptions_business_profile_id ON public.subscriptions(business_profile_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_stripe_subscription_id') THEN
        CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_stripe_customer_id') THEN
        CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_billing_history_business_profile_id') THEN
        CREATE INDEX idx_billing_history_business_profile_id ON public.billing_history(business_profile_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_billing_history_stripe_invoice_id') THEN
        CREATE INDEX idx_billing_history_stripe_invoice_id ON public.billing_history(stripe_invoice_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_billing_history_status') THEN
        CREATE INDEX idx_billing_history_status ON public.billing_history(status);
    END IF;
END
$$;
