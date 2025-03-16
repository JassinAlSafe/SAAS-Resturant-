-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view ingredients" ON ingredients;
DROP POLICY IF EXISTS "Staff can insert ingredients" ON ingredients;
DROP POLICY IF EXISTS "Staff can update ingredients" ON ingredients;
DROP POLICY IF EXISTS "Admins and managers can delete ingredients" ON ingredients;

-- Create new policies that filter by business_profile_id
CREATE POLICY "Users can view ingredients for their business"
ON ingredients FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = ingredients.business_profile_id
    )
);

CREATE POLICY "Users can insert ingredients for their business"
ON ingredients FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = ingredients.business_profile_id
    )
);

CREATE POLICY "Users can update ingredients for their business"
ON ingredients FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = ingredients.business_profile_id
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = ingredients.business_profile_id
    )
);

CREATE POLICY "Users can delete ingredients for their business"
ON ingredients FOR DELETE
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM business_profile_users 
        WHERE business_profile_id = ingredients.business_profile_id
    )
); 