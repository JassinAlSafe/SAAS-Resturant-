-- Modify recipes table to link to dishes table if needed
-- Check if dish_id column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'recipes' AND column_name = 'dish_id'
  ) THEN
    ALTER TABLE recipes ADD COLUMN dish_id UUID REFERENCES dishes(id);
    
    -- Create a unique constraint to ensure one recipe per dish
    ALTER TABLE recipes ADD CONSTRAINT recipes_dish_id_unique UNIQUE(dish_id);
    
    -- Create index for faster lookups
    CREATE INDEX idx_recipes_dish_id ON recipes(dish_id);
    
    -- Add instructions field if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'recipes' AND column_name = 'instructions'
    ) THEN
      ALTER TABLE recipes ADD COLUMN instructions TEXT;
    END IF;
  END IF;
END
$$;

-- Update existing recipes to link with dishes based on matching names if possible
DO $$
DECLARE
  dish_record RECORD;
BEGIN
  -- For each dish that doesn't have a linked recipe
  FOR dish_record IN 
    SELECT d.id, d.name 
    FROM dishes d
    LEFT JOIN recipes r ON d.id = r.dish_id
    WHERE r.id IS NULL
  LOOP
    -- Try to find a recipe with the same name
    UPDATE recipes
    SET dish_id = dish_record.id
    WHERE name = dish_record.name 
    AND dish_id IS NULL
    LIMIT 1;
    
    -- If no recipe was found, create a skeleton recipe
    IF NOT EXISTS (SELECT 1 FROM recipes WHERE dish_id = dish_record.id) THEN
      INSERT INTO recipes (
        name, 
        dish_id, 
        food_cost, 
        category, 
        popularity,
        user_id
      ) VALUES (
        dish_record.name,
        dish_record.id,
        0.00,  -- Default food cost
        'Uncategorized',  -- Default category
        0.00,  -- Default popularity
        (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)  -- First user as owner
      );
    END IF;
  END LOOP;
END
$$;

-- Add comment describing the relationship
COMMENT ON CONSTRAINT recipes_dish_id_unique ON recipes IS 'Each dish can have only one recipe, creating a one-to-one relationship between dishes and recipes'; 