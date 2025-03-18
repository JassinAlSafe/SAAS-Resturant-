# Fixing the Infinite Recursion Issue in RLS Policies

This README provides instructions on how to fix the infinite recursion issue you're experiencing with your Row-Level Security (RLS) policies for the `business_profile_users` relation.

## The Problem

You're encountering an error:

```
infinite recursion detected in policy for relation "business_profile_users"
```

This happens because the RLS policies are referencing themselves in a way that creates an infinite loop. Specifically, when one policy tries to check another policy that in turn depends on the first policy.

## The Solution

We've created a migration file that fixes this issue by:

1. Temporarily disabling RLS on the affected table
2. Dropping the problematic policies
3. Re-creating the policies using the `EXISTS` pattern instead of `IN` to avoid recursion
4. Re-enabling RLS
5. Also fixing potentially recursive policies on the `business_profiles` table

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI set up:

1. Make sure you're logged in to Supabase CLI:

   ```
   supabase login
   ```

2. Link your project if you haven't already:

   ```
   supabase link --project-ref <your-project-ref>
   ```

3. Apply the migration:
   ```
   supabase db push
   ```

### Option 2: Using Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the "SQL Editor" section
3. Create a new query
4. Copy the entire contents of the `src/db/migrations/fix_infinite_recursion_rls.sql` file
5. Run the query

### Option 3: Using psql (if you have direct database access)

```
psql -h <your-supabase-host> -d postgres -U postgres -f src/db/migrations/fix_infinite_recursion_rls.sql
```

## Testing the Fix

After applying the migration, you should:

1. Verify that you no longer see the infinite recursion error
2. Test the following operations:
   - Creating a new business profile
   - Adding a user to a business profile
   - Updating a user's role in a business profile
   - Deleting a user from a business profile
   - Viewing business profiles

## What Was Changed?

The key changes made to fix the issue were:

1. Switching from `IN` subqueries to `EXISTS` in policy definitions
2. Using direct table references instead of recursive subqueries
3. Correctly referencing the table being protected in the policy conditions

These changes maintain the security intent of your policies while avoiding the recursive reference pattern that caused the infinite loop.
