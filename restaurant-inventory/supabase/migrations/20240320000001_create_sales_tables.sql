-- Create enum for shift types
CREATE TYPE shift_type AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'All');

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    shift shift_type DEFAULT 'All',
    dish_id UUID NOT NULL REFERENCES dishes(id),
    dish_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ingredient alerts table
CREATE TABLE IF NOT EXISTS ingredient_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES auth.users(id)
);

-- Add indexes for better query performance (with IF NOT EXISTS checks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_date') THEN
        CREATE INDEX idx_sales_date ON sales(date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_dish_id') THEN
        CREATE INDEX idx_sales_dish_id ON sales(dish_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_user_id') THEN
        CREATE INDEX idx_sales_user_id ON sales(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ingredient_alerts_ingredient_id') THEN
        CREATE INDEX idx_ingredient_alerts_ingredient_id ON ingredient_alerts(ingredient_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ingredient_alerts_type') THEN
        CREATE INDEX idx_ingredient_alerts_type ON ingredient_alerts(type);
    END IF;
END $$;

-- Add RLS policies
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_alerts ENABLE ROW LEVEL SECURITY;

-- Sales policies
CREATE POLICY "Allow authenticated users to view sales"
    ON sales FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow staff to insert sales"
    ON sales FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role IN ('staff', 'manager', 'admin')
        )
    );

CREATE POLICY "Allow managers to update sales"
    ON sales FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role IN ('manager', 'admin')
        )
    );

CREATE POLICY "Allow managers to delete sales"
    ON sales FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role IN ('manager', 'admin')
        )
    );

-- Ingredient alerts policies
CREATE POLICY "Allow authenticated users to view alerts"
    ON ingredient_alerts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow staff to insert alerts"
    ON ingredient_alerts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role IN ('staff', 'manager', 'admin')
        )
    );

CREATE POLICY "Allow staff to update alerts"
    ON ingredient_alerts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role IN ('staff', 'manager', 'admin')
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sales table
DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 