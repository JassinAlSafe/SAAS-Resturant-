-- Create a custom type for the updates array
CREATE TYPE ingredient_update AS (
    ingredientId UUID,
    quantityUsed DECIMAL
);

-- Create the function to update ingredient stock levels
CREATE OR REPLACE FUNCTION update_ingredients_stock(updates ingredient_update[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    update_record ingredient_update;
BEGIN
    -- Loop through each update in the array
    FOR update_record IN SELECT * FROM unnest(updates)
    LOOP
        -- Update the ingredient's stock
        UPDATE ingredients
        SET 
            current_stock = current_stock - update_record.quantityUsed,
            updated_at = NOW()
        WHERE id = update_record.ingredientId;

        -- Check if we need to create a low stock alert
        INSERT INTO ingredient_alerts (ingredient_id, type, message, created_at)
        SELECT 
            update_record.ingredientId,
            'LOW_STOCK',
            'Ingredient stock is below minimum level',
            NOW()
        FROM ingredients
        WHERE 
            id = update_record.ingredientId
            AND current_stock < minimum_stock
            AND NOT EXISTS (
                SELECT 1 
                FROM ingredient_alerts
                WHERE 
                    ingredient_id = update_record.ingredientId
                    AND type = 'LOW_STOCK'
                    AND created_at > NOW() - INTERVAL '24 hours'
            );
    END LOOP;
END;
$$; 