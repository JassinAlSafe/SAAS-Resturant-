-- Add title column to notes table
ALTER TABLE notes 
ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Note';

-- Create index on title for faster search
CREATE INDEX notes_title_idx ON notes(title);

-- Update existing notes to have a title based on the first 50 characters of content
UPDATE notes 
SET title = 
  CASE
    WHEN LENGTH(content) <= 50 THEN content 
    ELSE SUBSTRING(content FROM 1 FOR 47) || '...'
  END
WHERE title = 'Untitled Note';

-- Remove the default constraint after migration
ALTER TABLE notes 
ALTER COLUMN title DROP DEFAULT; 