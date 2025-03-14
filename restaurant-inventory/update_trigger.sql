-- Update the function that calculates recipe food cost
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