-- Add new columns to the recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS food_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS allergens TEXT[],
ADD COLUMN IF NOT EXISTS popularity DECIMAL(3, 2),
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies to include the new columns
-- First, check if the policies exist and drop them if they do
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can select their own recipes" ON recipes;

-- Then create the policies
CREATE POLICY "Users can insert their own recipes" 
ON recipes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" 
ON recipes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" 
ON recipes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can select their own recipes" 
ON recipes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_popularity ON recipes(popularity); 