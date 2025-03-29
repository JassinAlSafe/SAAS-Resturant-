-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  entity_type TEXT NOT NULL CHECK (entity_type IN ('general', 'inventory', 'supplier', 'sale')),
  entity_id UUID,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create note_tags table
CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX notes_business_profile_id_idx ON notes(business_profile_id);
CREATE INDEX note_tags_business_profile_id_idx ON note_tags(business_profile_id);
CREATE INDEX notes_entity_type_idx ON notes(entity_type);
CREATE INDEX notes_tags_idx ON notes USING GIN(tags);

-- Enable RLS on the tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view notes for their business profiles" 
ON notes FOR SELECT 
USING (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert notes for their business profiles" 
ON notes FOR INSERT 
WITH CHECK (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update notes for their business profiles" 
ON notes FOR UPDATE 
USING (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete notes for their business profiles" 
ON notes FOR DELETE 
USING (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));

-- Create RLS policies for note_tags
CREATE POLICY "Users can view note tags for their business profiles" 
ON note_tags FOR SELECT 
USING (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert note tags for their business profiles" 
ON note_tags FOR INSERT 
WITH CHECK (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update note tags for their business profiles" 
ON note_tags FOR UPDATE 
USING (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete note tags for their business profiles" 
ON note_tags FOR DELETE 
USING (business_profile_id IN (
  SELECT business_profile_id 
  FROM business_profile_users 
  WHERE user_id = auth.uid()
));