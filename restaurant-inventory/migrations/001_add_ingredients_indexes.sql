-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_ingredients_business_profile ON ingredients (business_profile_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients (name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients (category);
CREATE INDEX IF NOT EXISTS idx_ingredients_supplier ON ingredients (supplier_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_reorder ON ingredients (reorder_level) WHERE reorder_level IS NOT NULL;

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ingredients_business_name ON ingredients (business_profile_id, name);
CREATE INDEX IF NOT EXISTS idx_ingredients_business_category ON ingredients (business_profile_id, category);

-- Add index for expiring items
CREATE INDEX IF NOT EXISTS idx_ingredients_expiry ON ingredients (expiry_date) WHERE expiry_date IS NOT NULL;

-- Add index for low stock queries
CREATE INDEX IF NOT EXISTS idx_ingredients_quantity ON ingredients (quantity) WHERE quantity > 0; 