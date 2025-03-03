-- SQL for creating the restaurant-icons storage bucket in Supabase

-- Create the storage bucket if it doesn't exist (private by default)
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-icons', 'restaurant-icons', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the restaurant-icons bucket

-- Allow authenticated users to upload/modify files in the restaurant-icons bucket
CREATE POLICY "Allow authenticated users to upload restaurant icons" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'restaurant-icons' AND
        (auth.uid() = owner OR owner IS NULL)
    );

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own restaurant icons" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- Allow users to select their own files
CREATE POLICY "Allow users to select their own restaurant icons" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own restaurant icons" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- Set file size limits and allowed MIME types
UPDATE storage.buckets
SET file_size_limit = 2097152, -- 2MB in bytes
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE id = 'restaurant-icons'; 