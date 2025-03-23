-- Update Basic plan
UPDATE subscription_plans
SET 
  monthly_price = 150,
  yearly_price = 1500,
  currency = 'SEK',
  is_popular = false,
  priority = 1
WHERE name = 'Basic';

-- Update Professional plan
UPDATE subscription_plans
SET 
  monthly_price = 300,
  yearly_price = 3000,
  currency = 'SEK',
  is_popular = true,
  priority = 2
WHERE name = 'Professional';

-- Update Enterprise plan
UPDATE subscription_plans
SET 
  monthly_price = 500,
  yearly_price = 5000,
  currency = 'SEK',
  is_popular = false,
  priority = 3
WHERE name = 'Enterprise';

-- Log the current state of subscription plans
SELECT id, name, monthly_price, yearly_price, currency, is_popular, priority 
FROM subscription_plans
ORDER BY priority;
