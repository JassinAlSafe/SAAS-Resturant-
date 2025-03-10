-- Add is_archived column to recipes table
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
-- Update existing recipes to have is_archived = false
UPDATE public.recipes SET is_archived = false WHERE is_archived IS NULL;
-- Create an index on is_archived for faster filtering
CREATE INDEX IF NOT EXISTS idx_recipes_is_archived ON public.recipes(is_archived);
