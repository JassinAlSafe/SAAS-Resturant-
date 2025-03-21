-- Update subscription plans to use SEK currency with new pricing
UPDATE subscription_plans
SET monthly_price = 
    CASE 
        WHEN name = 'Basic' THEN 150
        WHEN name = 'Professional' THEN 300
        WHEN name = 'Enterprise' THEN 500
    END,
    yearly_price = 
    CASE 
        WHEN name = 'Basic' THEN 1500
        WHEN name = 'Professional' THEN 3000
        WHEN name = 'Enterprise' THEN 5000
    END,
    currency = 'SEK';

-- Verify the changes
SELECT id, name, monthly_price, yearly_price, currency FROM subscription_plans;
