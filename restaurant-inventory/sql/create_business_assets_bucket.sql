-- SQL for creating the business_assets storage bucket in Supabase

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business_assets', 'business_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the business_assets bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own assets" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'business_assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view public files
CREATE POLICY "Anyone can view public business assets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'business_assets');

-- Allow users to update or delete their own files
CREATE POLICY "Users can update their own assets" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'business_assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own assets" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'business_assets' AND (storage.foldername(name))[1] = auth.uid()::text); 