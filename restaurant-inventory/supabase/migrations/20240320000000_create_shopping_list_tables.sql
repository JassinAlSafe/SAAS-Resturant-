-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE
);

-- Create shopping_list table
CREATE TABLE IF NOT EXISTS shopping_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    is_purchased BOOLEAN DEFAULT false NOT NULL,
    is_auto_generated BOOLEAN DEFAULT false NOT NULL,
    estimated_cost NUMERIC DEFAULT 0 NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Enable read for authenticated users" ON categories
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = categories.business_profile_id
    ));

CREATE POLICY "Enable insert for authenticated users" ON categories
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = categories.business_profile_id
    ));

CREATE POLICY "Enable update for authenticated users" ON categories
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = categories.business_profile_id
    ))
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = categories.business_profile_id
    ));

CREATE POLICY "Enable delete for authenticated users" ON categories
    FOR DELETE
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = categories.business_profile_id
    ));

-- Create policies for shopping_list
CREATE POLICY "Enable read for authenticated users" ON shopping_list
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = shopping_list.business_profile_id
    ));

CREATE POLICY "Enable insert for authenticated users" ON shopping_list
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = shopping_list.business_profile_id
    ));

CREATE POLICY "Enable update for authenticated users" ON shopping_list
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = shopping_list.business_profile_id
    ))
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = shopping_list.business_profile_id
    ));

CREATE POLICY "Enable delete for authenticated users" ON shopping_list
    FOR DELETE
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM business_profile_users WHERE business_profile_id = shopping_list.business_profile_id
    ));

-- Create function to generate shopping list from inventory
CREATE OR REPLACE FUNCTION generate_shopping_list()
RETURNS SETOF shopping_list
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete existing auto-generated items that haven't been purchased
    DELETE FROM shopping_list
    WHERE is_auto_generated = true AND is_purchased = false;
    
    -- Insert new items based on low inventory
    INSERT INTO shopping_list (
        name,
        quantity,
        unit,
        category,
        is_auto_generated,
        estimated_cost,
        inventory_item_id,
        business_profile_id
    )
    SELECT 
        i.name,
        GREATEST(i.reorder_level - i.quantity, 0),
        i.unit,
        i.category,
        true,
        GREATEST(i.reorder_level - i.quantity, 0) * i.cost,
        i.id,
        i.business_profile_id
    FROM inventory_items i
    WHERE i.quantity <= i.reorder_level
    AND i.business_profile_id = auth.uid();

    RETURN QUERY SELECT * FROM shopping_list WHERE is_auto_generated = true AND is_purchased = false;
END;
$$; 