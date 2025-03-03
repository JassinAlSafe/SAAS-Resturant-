-- Simpler SQL script to fix RLS policies for restaurant-icons bucket
-- Run each statement separately if you encounter errors

-- Create the trigger function to set owner automatically
CREATE OR REPLACE FUNCTION storage_objects_set_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the owner to the authenticated user's ID
    NEW.owner = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (this will fail if it already exists, which is fine)
DROP TRIGGER IF EXISTS set_restaurant_icons_owner ON storage.objects;
CREATE TRIGGER set_restaurant_icons_owner
    BEFORE INSERT ON storage.objects
    FOR EACH ROW
    WHEN (NEW.bucket_id = 'restaurant-icons')
    EXECUTE FUNCTION storage_objects_set_owner();

-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-icons', 'restaurant-icons', false)
ON CONFLICT (id) DO NOTHING;

-- Set file size limits and allowed MIME types
UPDATE storage.buckets
SET file_size_limit = 2097152, -- 2MB in bytes
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE id = 'restaurant-icons';

-- The following statements will fail if policies already exist
-- If they fail, you can comment them out and run the ALTER statements below instead

-- Try to create the INSERT policy
CREATE POLICY "Allow authenticated users to upload restaurant icons" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'restaurant-icons'
    );

-- Try to create the UPDATE policy
CREATE POLICY "Allow users to update their own restaurant icons" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- Try to create the SELECT policy
CREATE POLICY "Allow users to select their own restaurant icons" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- Try to create the DELETE policy
CREATE POLICY "Allow users to delete their own restaurant icons" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- If the CREATE POLICY statements above fail, uncomment and run these ALTER statements instead:

/*
-- Alter the INSERT policy
ALTER POLICY "Allow authenticated users to upload restaurant icons" ON storage.objects
    WITH CHECK (
        bucket_id = 'restaurant-icons'
    );

-- Alter the UPDATE policy
ALTER POLICY "Allow users to update their own restaurant icons" ON storage.objects
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- Alter the SELECT policy
ALTER POLICY "Allow users to select their own restaurant icons" ON storage.objects
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );

-- Alter the DELETE policy
ALTER POLICY "Allow users to delete their own restaurant icons" ON storage.objects
    USING (
        bucket_id = 'restaurant-icons' AND
        auth.uid() = owner
    );
*/ 