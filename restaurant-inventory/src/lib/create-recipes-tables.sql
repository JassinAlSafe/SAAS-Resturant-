-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL
);

-- Add foreign key if auth.users exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') THEN
    BEGIN
      ALTER TABLE recipes ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Foreign key constraint on user_id already exists or could not be created';
    END;
  END IF;
END
$$;

-- Enable RLS for recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique combination of recipe and ingredient
  UNIQUE(recipe_id, ingredient_id)
);

-- Add foreign key constraints if the referenced tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes') THEN
    BEGIN
      ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_recipe_id_fkey
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Foreign key constraint on recipe_id already exists or could not be created';
    END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ingredients') THEN
    BEGIN
      ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Foreign key constraint on ingredient_id already exists or could not be created';
    END;
  END IF;
END
$$;

-- Enable RLS for recipe_ingredients
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies for recipes table
-- Policy: Users can only see their own recipes
DROP POLICY IF EXISTS "Users can only see their own recipes" ON recipes;
CREATE POLICY "Users can only see their own recipes"
ON recipes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own recipes
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
CREATE POLICY "Users can insert their own recipes"
ON recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recipes
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
CREATE POLICY "Users can update their own recipes"
ON recipes
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own recipes
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
CREATE POLICY "Users can delete their own recipes"
ON recipes
FOR DELETE
USING (auth.uid() = user_id);

-- Policies for recipe_ingredients table
-- Policy: Users can select recipe ingredients for recipes they own
DROP POLICY IF EXISTS "Users can select recipe ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can select recipe ingredients for recipes they own"
ON recipe_ingredients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Policy: Users can insert recipe ingredients for recipes they own
DROP POLICY IF EXISTS "Users can insert recipe ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can insert recipe ingredients for recipes they own"
ON recipe_ingredients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Policy: Users can update recipe ingredients for recipes they own
DROP POLICY IF EXISTS "Users can update recipe ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can update recipe ingredients for recipes they own"
ON recipe_ingredients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Policy: Users can delete recipe ingredients for recipes they own
DROP POLICY IF EXISTS "Users can delete recipe ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can delete recipe ingredients for recipes they own"
ON recipe_ingredients
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes(user_id);
CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_id_idx ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_ingredients_ingredient_id_idx ON recipe_ingredients(ingredient_id); 