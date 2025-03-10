-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if the sales table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
    -- Create the sales table if it doesn't exist
    CREATE TABLE sales (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      dish_id UUID NOT NULL,
      dish_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      notes TEXT,
      user_id UUID NOT NULL
    );
    
    -- Log success message
    RAISE NOTICE 'Created sales table';
  ELSE
    -- Check if user_id column exists, add it if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'user_id') THEN
      ALTER TABLE sales ADD COLUMN user_id UUID NOT NULL;
      RAISE NOTICE 'Added user_id column to sales table';
    ELSE
      RAISE NOTICE 'Sales table already has user_id column';
    END IF;
  END IF;
END
$$;

-- Add foreign key if auth.users exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'user_id')
  THEN
    BEGIN
      ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_user_id_fkey;
      ALTER TABLE sales ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
      RAISE NOTICE 'Added foreign key constraint for user_id';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Foreign key constraint on user_id already exists or could not be created: %', SQLERRM;
    END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'dish_id')
  THEN
    BEGIN
      ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_dish_id_fkey;
      ALTER TABLE sales ADD CONSTRAINT sales_dish_id_fkey FOREIGN KEY (dish_id) REFERENCES recipes(id);
      RAISE NOTICE 'Added foreign key constraint for dish_id';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Foreign key constraint on dish_id already exists or could not be created: %', SQLERRM;
    END;
  END IF;
END
$$;

-- Enable RLS for sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Before creating policies, make sure the user_id column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sales' AND column_name = 'user_id') THEN
    -- Drop existing policies first to avoid conflicts
    DROP POLICY IF EXISTS "Users can only see their own sales" ON sales;
    DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
    DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
    DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
    
    -- Create policies
    CREATE POLICY "Users can only see their own sales"
    ON sales
    FOR SELECT
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own sales"
    ON sales
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own sales"
    ON sales
    FOR UPDATE
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own sales"
    ON sales
    FOR DELETE
    USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Created RLS policies for sales table';
  ELSE
    RAISE NOTICE 'Cannot create policies: user_id column does not exist in sales table';
  END IF;
END
$$;

-- Create indexes for better performance if they don't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sales' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS sales_user_id_idx ON sales(user_id);
    RAISE NOTICE 'Created index on sales.user_id';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sales' AND column_name = 'date') THEN
    CREATE INDEX IF NOT EXISTS sales_date_idx ON sales(date);
    RAISE NOTICE 'Created index on sales.date';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sales' AND column_name = 'dish_id') THEN
    CREATE INDEX IF NOT EXISTS sales_dish_id_idx ON sales(dish_id);
    RAISE NOTICE 'Created index on sales.dish_id';
  END IF;
END
$$; 