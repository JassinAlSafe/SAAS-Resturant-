-- Create recipe_ingredients junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,  -- This allows for unit conversion if needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_id_idx ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_ingredients_ingredient_id_idx ON recipe_ingredients(ingredient_id);

-- Enable Row Level Security
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies for recipe_ingredients table
-- Policy: Users can select recipe ingredients for recipes they own
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

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_recipe_ingredients ON recipe_ingredients;
CREATE TRIGGER set_timestamp_recipe_ingredients
BEFORE UPDATE ON recipe_ingredients
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 