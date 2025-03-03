-- SQL to fix RLS policies for restaurant-icons bucket

-- First, drop existing policies if they exist
DO $$
BEGIN
    -- Drop policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Allow authenticated users to upload restaurant icons" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Policy "Allow authenticated users to upload restaurant icons" does not exist or could not be dropped';
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow users to update their own restaurant icons" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Policy "Allow users to update their own restaurant icons" does not exist or could not be dropped';
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow users to select their own restaurant icons" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Policy "Allow users to select their own restaurant icons" does not exist or could not be dropped';
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow users to delete their own restaurant icons" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Policy "Allow users to delete their own restaurant icons" does not exist or could not be dropped';
    END;
END $$;

-- Create a trigger function to automatically set the owner field
CREATE OR REPLACE FUNCTION storage_objects_set_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the owner to the authenticated user's ID
    NEW.owner = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function before insert
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

-- Recreate the policies with proper owner checks
DO $$
BEGIN
    -- Create policies if they don't exist
    BEGIN
        CREATE POLICY "Allow authenticated users to upload restaurant icons" ON storage.objects
            FOR INSERT TO authenticated
            WITH CHECK (
                bucket_id = 'restaurant-icons'
            );
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow authenticated users to upload restaurant icons" already exists, updating...';
        ALTER POLICY "Allow authenticated users to upload restaurant icons" ON storage.objects
            WITH CHECK (
                bucket_id = 'restaurant-icons'
            );
    END;
    
    BEGIN
        CREATE POLICY "Allow users to update their own restaurant icons" ON storage.objects
            FOR UPDATE TO authenticated
            USING (
                bucket_id = 'restaurant-icons' AND
                auth.uid() = owner
            );
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow users to update their own restaurant icons" already exists, updating...';
        ALTER POLICY "Allow users to update their own restaurant icons" ON storage.objects
            USING (
                bucket_id = 'restaurant-icons' AND
                auth.uid() = owner
            );
    END;
    
    BEGIN
        CREATE POLICY "Allow users to select their own restaurant icons" ON storage.objects
            FOR SELECT TO authenticated
            USING (
                bucket_id = 'restaurant-icons' AND
                auth.uid() = owner
            );
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow users to select their own restaurant icons" already exists, updating...';
        ALTER POLICY "Allow users to select their own restaurant icons" ON storage.objects
            USING (
                bucket_id = 'restaurant-icons' AND
                auth.uid() = owner
            );
    END;
    
    BEGIN
        CREATE POLICY "Allow users to delete their own restaurant icons" ON storage.objects
            FOR DELETE TO authenticated
            USING (
                bucket_id = 'restaurant-icons' AND
                auth.uid() = owner
            );
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow users to delete their own restaurant icons" already exists, updating...';
        ALTER POLICY "Allow users to delete their own restaurant icons" ON storage.objects
            USING (
                bucket_id = 'restaurant-icons' AND
                auth.uid() = owner
            );
    END;
END $$; 