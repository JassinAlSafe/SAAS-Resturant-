-- Ensure notes table has tags column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notes' AND column_name = 'tags'
    ) THEN
        ALTER TABLE notes ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Create index on tags for faster search if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'notes_tags_idx'
    ) THEN
        CREATE INDEX notes_tags_idx ON notes USING GIN(tags);
    END IF;
END $$;

-- Ensure note_tags table exists
CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on business_profile_id for note_tags if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'note_tags_business_profile_id_idx'
    ) THEN
        CREATE INDEX note_tags_business_profile_id_idx ON note_tags(business_profile_id);
    END IF;
END $$;

-- Enable RLS on the note_tags table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE tablename = 'note_tags' AND rowsecurity = true
    ) THEN
        ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies for note_tags if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'note_tags' AND policyname = 'Users can view note tags for their business profiles'
    ) THEN
        CREATE POLICY "Users can view note tags for their business profiles" 
        ON note_tags FOR SELECT 
        USING (business_profile_id IN (
          SELECT business_profile_id 
          FROM business_profile_users 
          WHERE user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'note_tags' AND policyname = 'Users can insert note tags for their business profiles'
    ) THEN
        CREATE POLICY "Users can insert note tags for their business profiles" 
        ON note_tags FOR INSERT 
        WITH CHECK (business_profile_id IN (
          SELECT business_profile_id 
          FROM business_profile_users 
          WHERE user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'note_tags' AND policyname = 'Users can update note tags for their business profiles'
    ) THEN
        CREATE POLICY "Users can update note tags for their business profiles" 
        ON note_tags FOR UPDATE 
        USING (business_profile_id IN (
          SELECT business_profile_id 
          FROM business_profile_users 
          WHERE user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'note_tags' AND policyname = 'Users can delete note tags for their business profiles'
    ) THEN
        CREATE POLICY "Users can delete note tags for their business profiles" 
        ON note_tags FOR DELETE 
        USING (business_profile_id IN (
          SELECT business_profile_id 
          FROM business_profile_users 
          WHERE user_id = auth.uid()
        ));
    END IF;
END $$; 