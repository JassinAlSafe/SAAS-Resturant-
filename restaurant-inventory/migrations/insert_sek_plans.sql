-- Insert new subscription plans with SEK currency and pricing
INSERT INTO subscription_plans (name, description, features, monthly_price, yearly_price, currency, is_popular, priority)
VALUES 
  ('Basic', 'Perfect for small restaurants just getting started', 
   '["Up to 500 inventory items", "Basic reporting", "1 user account", "Email support"]', 
   150, 1500, 'SEK', FALSE, 1),
  
  ('Professional', 'Ideal for growing restaurants with more needs', 
   '["Unlimited inventory items", "Advanced reporting & analytics", "Up to 5 user accounts", "Priority email support", "Menu planning tools", "Supplier management"]', 
   300, 3000, 'SEK', TRUE, 2),
  
  ('Enterprise', 'For restaurant chains and large operations', 
   '["Everything in Professional", "Unlimited user accounts", "Multi-location support", "API access", "Dedicated account manager", "Custom integrations", "24/7 phone support"]', 
   500, 5000, 'SEK', FALSE, 3);
