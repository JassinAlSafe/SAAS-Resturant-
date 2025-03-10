-- Add expiry_date column to ingredients table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='ingredients' AND column_name='expiry_date'
    ) THEN
        -- Add the column
        ALTER TABLE public.ingredients ADD COLUMN expiry_date DATE;
        
        -- Create an index for better performance
        CREATE INDEX IF NOT EXISTS ingredients_expiry_date_idx ON public.ingredients (expiry_date);
        
        RAISE NOTICE 'Added expiry_date column to ingredients table';
    ELSE
        RAISE NOTICE 'expiry_date column already exists in ingredients table';
    END IF;
END $$; 