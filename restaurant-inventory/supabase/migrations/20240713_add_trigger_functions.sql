-- Create a trigger function to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to all tables that have updated_at column if they don't already have it
DO $$
DECLARE
  table_record RECORD;
BEGIN
  -- Loop through tables with updated_at column
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    -- Check if the trigger already exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'set_timestamp_' || table_record.table_name
    ) THEN
      -- Create dynamic SQL to add trigger
      EXECUTE format('
        CREATE TRIGGER set_timestamp_%I
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      ', table_record.table_name, table_record.table_name);
    END IF;
  END LOOP;
END;
$$;

-- Create a function to check for low stock and create alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- If stock falls below reorder level, create an alert
  IF NEW.current_stock < NEW.reorder_level THEN
    -- Only create alert if one doesn't exist in the last 24 hours
    IF NOT EXISTS (
      SELECT 1 FROM ingredient_alerts
      WHERE ingredient_id = NEW.id
      AND type = 'LOW_STOCK'
      AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      INSERT INTO ingredient_alerts (
        ingredient_id,
        type,
        message
      ) VALUES (
        NEW.id,
        'LOW_STOCK',
        'Ingredient "' || NEW.name || '" is below reorder level (' || 
        NEW.current_stock || ' ' || NEW.unit || ' remaining)'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add low stock trigger to ingredients table
DROP TRIGGER IF EXISTS check_low_stock_trigger ON ingredients;
CREATE TRIGGER check_low_stock_trigger
AFTER UPDATE OF current_stock ON ingredients
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();

-- Create a function that updates food cost when recipe ingredients change
CREATE OR REPLACE FUNCTION update_recipe_food_cost()
RETURNS TRIGGER AS $$
DECLARE
  total_cost DECIMAL(10,2) := 0;
BEGIN
  -- Calculate total cost based on current ingredients
  SELECT COALESCE(SUM(ri.quantity * i.cost), 0)
  INTO total_cost
  FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  -- Update the recipe's food cost
  UPDATE recipes
  SET 
    food_cost = total_cost,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  RETURN NULL; -- for AFTER triggers
END;
$$ LANGUAGE plpgsql;

-- Add trigger for when recipe ingredients change
DROP TRIGGER IF EXISTS update_recipe_cost_trigger ON recipe_ingredients;
CREATE TRIGGER update_recipe_cost_trigger
AFTER INSERT OR UPDATE OR DELETE ON recipe_ingredients
FOR EACH ROW
EXECUTE FUNCTION update_recipe_food_cost();

-- Create a comment explaining the purposes of these functions
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp when a row is modified';
COMMENT ON FUNCTION check_low_stock() IS 'Creates alerts when ingredient stock falls below reorder level';
COMMENT ON FUNCTION update_recipe_food_cost() IS 'Recalculates and updates a recipe''s food cost when ingredients change'; 