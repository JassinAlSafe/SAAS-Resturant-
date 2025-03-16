-- Create inventory_impact table for detailed tracking of inventory deductions
CREATE TABLE IF NOT EXISTS inventory_impact (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  deducted_quantity DECIMAL(10,2) NOT NULL,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_impact_sale_id ON inventory_impact(sale_id);
CREATE INDEX IF NOT EXISTS idx_inventory_impact_ingredient_id ON inventory_impact(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_impact_created_at ON inventory_impact(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_impact_business_profile_id ON inventory_impact(business_profile_id);

-- Enable Row Level Security
ALTER TABLE inventory_impact ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_impact
CREATE POLICY "Users can view inventory impact for their business"
ON inventory_impact FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = inventory_impact.business_profile_id
    )
);

-- Allow staff to insert inventory impact records
CREATE POLICY "Allow users to insert inventory impact for their business"
ON inventory_impact FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = inventory_impact.business_profile_id
    )
);

-- Create function to automatically update ingredient stock when sales occur
CREATE OR REPLACE FUNCTION update_inventory_after_sale()
RETURNS TRIGGER AS $$
DECLARE
  dish_ingredients RECORD;
  ingredient_quantity DECIMAL;
  business_profile_id UUID;
BEGIN
  -- Get the business_profile_id from the sale
  SELECT s.business_profile_id INTO business_profile_id
  FROM sales s
  WHERE s.id = NEW.id;

  -- Loop through all ingredients used in the dish's recipe
  FOR dish_ingredients IN 
    SELECT ri.ingredient_id, ri.quantity * NEW.quantity as total_quantity
    FROM recipes r
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    WHERE r.dish_id = NEW.dish_id
  LOOP
    -- Insert a record into inventory_impact
    INSERT INTO inventory_impact (
      sale_id, 
      ingredient_id, 
      deducted_quantity,
      business_profile_id
    ) VALUES (
      NEW.id,
      dish_ingredients.ingredient_id,
      dish_ingredients.total_quantity,
      business_profile_id
    );
    
    -- Update ingredient stock
    UPDATE ingredients
    SET 
      current_stock = current_stock - dish_ingredients.total_quantity,
      updated_at = NOW()
    WHERE id = dish_ingredients.ingredient_id
    AND business_profile_id = business_profile_id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update inventory when a sale is recorded
DROP TRIGGER IF EXISTS update_inventory_after_sale_trigger ON sales;
CREATE TRIGGER update_inventory_after_sale_trigger
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION update_inventory_after_sale(); 