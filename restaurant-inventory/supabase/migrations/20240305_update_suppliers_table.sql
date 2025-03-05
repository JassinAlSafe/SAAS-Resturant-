-- Update suppliers table with new fields
ALTER TABLE suppliers
ADD COLUMN categories text[] DEFAULT ARRAY['OTHER']::text[],
ADD COLUMN is_preferred boolean DEFAULT false,
ADD COLUMN status text DEFAULT 'ACTIVE',
ADD COLUMN rating integer DEFAULT 0,
ADD COLUMN last_order_date timestamp with time zone,
ADD COLUMN logo text;

-- Add check constraints
ALTER TABLE suppliers
ADD CONSTRAINT suppliers_status_check CHECK (status IN ('ACTIVE', 'INACTIVE')),
ADD CONSTRAINT suppliers_rating_check CHECK (rating >= 0 AND rating <= 5);

-- Create an index on commonly queried fields
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_is_preferred ON suppliers(is_preferred);
CREATE INDEX idx_suppliers_last_order_date ON suppliers(last_order_date);

-- Add RLS policies for the new fields
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON suppliers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON suppliers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON suppliers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON suppliers
    FOR DELETE
    TO authenticated
    USING (true); 