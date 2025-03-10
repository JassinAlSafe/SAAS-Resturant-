-- Add supplier_id column to ingredients table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='ingredients' AND column_name='supplier_id'
    ) THEN
        -- Add the column
        ALTER TABLE public.ingredients ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;
        
        -- Create an index for better performance
        CREATE INDEX IF NOT EXISTS ingredients_supplier_id_idx ON public.ingredients (supplier_id);
        
        RAISE NOTICE 'Added supplier_id column to ingredients table';
    ELSE
        RAISE NOTICE 'supplier_id column already exists in ingredients table';
    END IF;
END $$; 