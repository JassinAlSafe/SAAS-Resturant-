-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  monthly_price DECIMAL(10, 2) NOT NULL,
  yearly_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_popular BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
  trial_end TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  resumes_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  brand VARCHAR(50),
  last_four VARCHAR(4),
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  name VARCHAR(255),
  stripe_payment_method_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  pdf_url TEXT,
  hosted_invoice_url TEXT,
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, features, monthly_price, yearly_price, currency, is_popular, priority)
VALUES 
  ('Basic', 'Perfect for small restaurants just getting started', 
   '["Up to 500 inventory items", "Basic reporting", "1 user account", "Email support"]', 
   29.99, 299.99, 'USD', FALSE, 1),
  
  ('Professional', 'Ideal for growing restaurants with more needs', 
   '["Unlimited inventory items", "Advanced reporting & analytics", "Up to 5 user accounts", "Priority email support", "Menu planning tools", "Supplier management"]', 
   59.99, 599.99, 'USD', TRUE, 2),
  
  ('Enterprise', 'For restaurant chains and large operations', 
   '["Everything in Professional", "Unlimited user accounts", "Multi-location support", "API access", "Dedicated account manager", "Custom integrations", "24/7 phone support"]', 
   119.99, 1199.99, 'USD', FALSE, 3);

-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans (anyone can read)
CREATE POLICY subscription_plans_select_policy ON subscription_plans
  FOR SELECT USING (true);

-- Create policies for subscriptions
CREATE POLICY subscriptions_select_policy ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for payment_methods
CREATE POLICY payment_methods_select_policy ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY payment_methods_insert_policy ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY payment_methods_update_policy ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY payment_methods_delete_policy ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for invoices
CREATE POLICY invoices_select_policy ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for invoice_items
CREATE POLICY invoice_items_select_policy ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );
