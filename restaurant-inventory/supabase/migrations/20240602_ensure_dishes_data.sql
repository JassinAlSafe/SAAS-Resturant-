-- Ensure dishes table exists
CREATE TABLE IF NOT EXISTS dishes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a function to copy data from recipes to dishes if recipes table exists
CREATE OR REPLACE FUNCTION copy_recipes_to_dishes()
RETURNS void AS $$
BEGIN
  -- Check if recipes table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'recipes'
  ) THEN
    -- Copy data from recipes to dishes, avoiding duplicates
    INSERT INTO dishes (id, name, price, created_at, updated_at)
    SELECT r.id, r.name, r.price, r.created_at, r.updated_at
    FROM recipes r
    WHERE NOT EXISTS (
      SELECT 1 FROM dishes d WHERE d.id = r.id
    );
    
    RAISE NOTICE 'Copied data from recipes to dishes table';
  ELSE
    RAISE NOTICE 'Recipes table does not exist, no data to copy';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT copy_recipes_to_dishes();

-- Create sample dishes if the table is empty
INSERT INTO dishes (name, price)
SELECT 'Sample Dish 1', 10.99
WHERE NOT EXISTS (SELECT 1 FROM dishes LIMIT 1);

INSERT INTO dishes (name, price)
SELECT 'Sample Dish 2', 15.99
WHERE NOT EXISTS (SELECT 1 FROM dishes LIMIT 1);

INSERT INTO dishes (name, price)
SELECT 'Sample Dish 3', 20.99
WHERE NOT EXISTS (SELECT 1 FROM dishes LIMIT 1);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_dishes_name ON dishes(name);

-- Ensure RLS is enabled
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'dishes' AND policyname = 'Anyone can view dishes'
  ) THEN
    CREATE POLICY "Anyone can view dishes"
    ON dishes FOR SELECT
    TO authenticated
    USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'dishes' AND policyname = 'Staff can insert dishes'
  ) THEN
    CREATE POLICY "Staff can insert dishes"
    ON dishes FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'dishes' AND policyname = 'Staff can update dishes'
  ) THEN
    CREATE POLICY "Staff can update dishes"
    ON dishes FOR UPDATE
    TO authenticated
    USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'dishes' AND policyname = 'Staff can delete dishes'
  ) THEN
    CREATE POLICY "Staff can delete dishes"
    ON dishes FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$; 