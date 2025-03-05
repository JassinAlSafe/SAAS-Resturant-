-- Add user_id column to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- Update RLS policies to include the user_id column
DROP POLICY IF EXISTS "Staff can insert sales" ON sales;
CREATE POLICY "Staff can insert sales" 
ON sales FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Add updated_at column for consistency
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON sales;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 