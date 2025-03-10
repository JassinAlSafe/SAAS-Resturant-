-- This script focuses only on creating the trigger function to set the owner field
-- This is the most critical part of the fix for the RLS policy issue

-- Create or replace the trigger function to set the owner field
CREATE OR REPLACE FUNCTION storage.storage_objects_set_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the owner field to the authenticated user's ID for restaurant-icons bucket
    IF NEW.bucket_id = 'restaurant-icons' THEN
        NEW.owner = auth.uid();
        RAISE NOTICE 'Setting owner to %', auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS set_restaurant_icons_owner ON storage.objects;

-- Create the trigger to automatically set the owner field
CREATE TRIGGER set_restaurant_icons_owner
BEFORE INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'restaurant-icons')
EXECUTE FUNCTION storage.storage_objects_set_owner();

-- Verify that the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_schema, 
    event_object_table, 
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'set_restaurant_icons_owner'; 