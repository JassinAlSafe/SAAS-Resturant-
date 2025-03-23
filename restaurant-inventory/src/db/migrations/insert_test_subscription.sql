-- Insert a test subscription for the current user
INSERT INTO subscriptions (
  id,
  user_id,
  business_profile_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  billing_interval,
  stripe_subscription_id,
  stripe_customer_id,
  stripe_price_id,
  plan_name,
  created_at,
  updated_at,
  plan_id
) VALUES (
  gen_random_uuid(),
  'ea330701-344b-4e8d-85b6-ce8d5f22534e', -- Current User ID from logs
  '15c2b5a0-04c7-44bc-b619-e39c7082f164', -- Current Business Profile ID from logs
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  false,
  'month',
  'sub_mock_12345',
  'cus_mock_12345',
  'price_XXXX', -- Replace with your actual price ID if available
  'Professional',
  NOW(),
  NOW(),
  '4329f8e1-e664-4856-9ff5-f2fd90b229c2'  -- Using existing Professional plan ID
);

-- Update the business profile with subscription information
UPDATE business_profiles
SET 
  subscription_plan = 'Professional',
  subscription_status = 'active',
  subscription_current_period_end = NOW() + INTERVAL '30 days',
  subscription_price_id = 'price_XXXX', -- Replace with your actual price ID if available
  subscription_product_id = 'prod_RzCVIogVpsmUTr' -- Your actual product ID
WHERE 
  id = '15c2b5a0-04c7-44bc-b619-e39c7082f164';  -- Current Business Profile ID from logs
