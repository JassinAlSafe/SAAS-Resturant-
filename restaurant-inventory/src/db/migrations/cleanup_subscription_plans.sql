-- First, identify the duplicate subscription plans and keep the first one for each name
WITH plan_keepers AS (
  SELECT 
    name,
    (ARRAY_AGG(id ORDER BY id))[1] as keep_id
  FROM 
    subscription_plans
  GROUP BY 
    name
)

-- Update any subscriptions that reference duplicate plans to point to the plans we're keeping
UPDATE subscriptions
SET plan_id = pk.keep_id
FROM subscription_plans sp
JOIN plan_keepers pk ON sp.name = pk.name
WHERE 
  subscriptions.plan_id = sp.id 
  AND sp.id != pk.keep_id;

-- Now we can safely delete the duplicates
DELETE FROM subscription_plans
WHERE id IN (
  SELECT sp.id
  FROM subscription_plans sp
  JOIN plan_keepers pk ON sp.name = pk.name
  WHERE sp.id != pk.keep_id
);

-- Make sure all subscription plans have the correct currency set to SEK
UPDATE subscription_plans
SET currency = 'SEK'
WHERE currency IS NULL OR currency != 'SEK';

-- Ensure all plans have the correct monthly and yearly prices
UPDATE subscription_plans
SET 
  monthly_price = 150,
  yearly_price = 1500
WHERE name = 'Basic';

UPDATE subscription_plans
SET 
  monthly_price = 300,
  yearly_price = 3000
WHERE name = 'Professional';

UPDATE subscription_plans
SET 
  monthly_price = 500,
  yearly_price = 5000
WHERE name = 'Enterprise';

-- Make sure is_popular is set correctly
UPDATE subscription_plans
SET is_popular = true
WHERE name = 'Professional';

UPDATE subscription_plans
SET is_popular = false
WHERE name != 'Professional';

-- Set priorities correctly
UPDATE subscription_plans
SET priority = 1
WHERE name = 'Basic';

UPDATE subscription_plans
SET priority = 2
WHERE name = 'Professional';

UPDATE subscription_plans
SET priority = 3
WHERE name = 'Enterprise';
