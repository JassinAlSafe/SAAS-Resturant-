# Fixing Supabase Storage RLS Policy Issues

## Error Message

You may encounter the following error when trying to upload files to the `restaurant-icons` bucket:

```json
{
  "error": "Row-Level Security Policy Error",
  "details": {
    "message": "The operation was blocked by Supabase RLS policies.",
    "originalError": {
      "name": "StorageApiError",
      "message": "new row violates row-level security policy",
      "status": 400
    }
  }
}
```

## The Problem

This error occurs because the Row-Level Security (RLS) policies for the `restaurant-icons` bucket are not properly configured. Specifically, the `owner` field is not being set automatically when files are uploaded, which causes the RLS policy to block the operation.

## Solution (Step-by-Step)

Follow these steps in order to fix the issue:

### Step 1: Fix the Owner Trigger (Most Important)

1. Open the Supabase SQL Editor
2. Run the `fix_owner_trigger.sql` script
3. This script creates a trigger function that automatically sets the `owner` field to the authenticated user's ID when files are uploaded to the `restaurant-icons` bucket

This is the most critical part of the fix. In many cases, just implementing this trigger will resolve the issue.

### Step 2: If Step 1 Doesn't Work, Try Updating Existing Policies

If you're still encountering issues after implementing the trigger, run the `update_existing_policies.sql` script to update the existing policies with the correct conditions.

### Step 3: If You're Still Having Issues, Reset Everything

If you're still experiencing problems, run the `reset_restaurant_icons_rls.sql` script to completely reset and properly configure all RLS policies for the `restaurant-icons` bucket. This script:

1. Drops all existing policies
2. Creates the trigger function
3. Creates new policies with the correct conditions
4. Verifies that everything is set up correctly

## Troubleshooting Common Errors

### "Policy already exists" error

If you see an error like:

```
ERROR: 42710: policy "Allow authenticated users to upload restaurant icons" for table "objects" already exists.
```

Use the `update_existing_policies.sql` script instead of trying to create new policies.

### Syntax errors with DROP POLICY

If you encounter syntax errors with DROP POLICY statements, use the `reset_restaurant_icons_rls.sql` script, which handles these errors gracefully.

## Verifying the Fix

After applying the fix, you should be able to:

1. Upload files to the `restaurant-icons` bucket without encountering RLS policy errors
2. View, update, and delete your own files, but not files uploaded by other users

## Additional Information

The RLS policies ensure that:

- Only authenticated users can upload files to the `restaurant-icons` bucket
- Users can only view, update, and delete their own files
- The `owner` field is automatically set to the authenticated user's ID when files are uploaded

The trigger mechanism is essential for this to work properly, as it ensures that the `owner` field is set correctly during the upload process.
