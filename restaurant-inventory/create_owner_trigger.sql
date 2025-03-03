-- Script to create the owner trigger function
-- This is the most important part of the fix

-- Create the trigger function to set owner automatically
CREATE OR REPLACE FUNCTION storage_objects_set_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the owner to the authenticated user's ID
    NEW.owner = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_restaurant_icons_owner ON storage.objects;
CREATE TRIGGER set_restaurant_icons_owner
    BEFORE INSERT ON storage.objects
    FOR EACH ROW
    WHEN (NEW.bucket_id = 'restaurant-icons')
    EXECUTE FUNCTION storage_objects_set_owner();

-- Verify the trigger was created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_schema, 
    event_object_table,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    trigger_name = 'set_restaurant_icons_owner'; 