-- Create shopping_list table
CREATE TABLE IF NOT EXISTS shopping_list (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id uuid REFERENCES ingredients(id) ON DELETE SET NULL,
    name text NOT NULL,
    quantity numeric NOT NULL,
    unit text NOT NULL,
    estimated_cost numeric DEFAULT 0,
    category text,
    is_auto_generated boolean DEFAULT false,
    is_purchased boolean DEFAULT false,
    added_at timestamp with time zone DEFAULT now(),
    purchased_at timestamp with time zone,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for frequently accessed columns
CREATE INDEX idx_shopping_list_inventory_item_id ON shopping_list(inventory_item_id);
CREATE INDEX idx_shopping_list_is_purchased ON shopping_list(is_purchased);
CREATE INDEX idx_shopping_list_is_auto_generated ON shopping_list(is_auto_generated);
CREATE INDEX idx_shopping_list_added_at ON shopping_list(added_at);

-- Add RLS policies for the shopping_list table
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all shopping list items
CREATE POLICY "Enable read access for authenticated users" ON shopping_list
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert shopping list items
CREATE POLICY "Enable insert access for authenticated users" ON shopping_list
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update their own shopping list items
CREATE POLICY "Enable update access for authenticated users" ON shopping_list
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete their own shopping list items
CREATE POLICY "Enable delete access for authenticated users" ON shopping_list
    FOR DELETE
    TO authenticated
    USING (true);

-- Add function to update inventory when items are marked as purchased
CREATE OR REPLACE FUNCTION update_inventory_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if the item is being marked as purchased
    IF NEW.is_purchased = true AND OLD.is_purchased = false AND NEW.inventory_item_id IS NOT NULL THEN
        -- Update the inventory quantity
        UPDATE ingredients
        SET quantity = quantity + NEW.quantity
        WHERE id = NEW.inventory_item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update inventory when items are purchased
CREATE TRIGGER update_inventory_after_purchase
AFTER UPDATE ON shopping_list
FOR EACH ROW
WHEN (NEW.is_purchased = true AND OLD.is_purchased = false)
EXECUTE FUNCTION update_inventory_on_purchase(); 