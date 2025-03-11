-- Add image_url column to ingredients table
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comment on the column
COMMENT ON COLUMN ingredients.image_url IS 'URL to the image of the ingredient';    