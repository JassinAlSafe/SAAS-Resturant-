# Security and RLS Policy Fixes

This document outlines the security improvements and bug fixes that have been implemented to address:

1. The infinite recursion issue in Row-Level Security (RLS) policies
2. Security concerns with using `getSession()` instead of `getUser()`

## 1. RLS Policy Fixes

### The Problem

The PostgreSQL error:

```
infinite recursion detected in policy for relation "business_profile_users"
```

This was occurring because the RLS policies were self-referential in a way that created an infinite loop. When checking permissions on a row, PostgreSQL would end up in a circular dependency where one check would trigger another check on the same table.

### The Solution

We created a new migration file (`src/db/migrations/fix_infinite_recursion_rls.sql`) that:

1. Temporarily disables RLS on the affected tables
2. Drops and recreates the problematic policies
3. Uses the `EXISTS` pattern instead of `IN` subqueries to avoid recursion
4. References tables directly in a way that prevents circular dependencies
5. Re-enables RLS with the improved policies

### How to Apply

1. Run the migration file against your Supabase database (see MIGRATION_README.md for detailed instructions)
2. Test the business profile creation flow to ensure it's working correctly

## 2. Authentication Security Improvements

### The Problem

Using `supabase.auth.getSession()` to check user authentication is less secure than using `supabase.auth.getUser()`. The session data comes directly from browser storage and can be tampered with, while `getUser()` validates the authentication state with the Supabase Auth server.

### The Solution

We've updated several files to use `getUser()` instead of `getSession()`:

1. `src/lib/stores/auth-store.ts`: Updated the authentication initialization to use `getUser()` first, then `getSession()` only for session-specific data
2. `src/lib/supabase.ts`: Updated connection testing to use `getUser()`
3. `src/lib/auth-context.tsx`: Changed authentication initialization to use `getUser()` first
4. `src/app/dashboard/layout.tsx`: Updated route protection to use `getUser()`
5. `src/lib/business-profile-context.tsx`: Already had a `validateAuth()` function using `getUser()`
6. `src/app/(auth)/onboarding/page.tsx`: Already using `getUser()` for authentication validation

### Other Security Enhancements

1. Added better error handling for RLS-related errors
2. Improved validation of user authentication before performing sensitive operations
3. Made the secure RPC function (`create_business_profile_with_user`) more reliable
4. Added fallback mechanisms when secure RPCs fail

## Deployment Instructions

### 1. Database Migration

First, apply the database migration to fix the infinite recursion issue:

- Option 1: Use Supabase CLI:

  ```
  supabase db push
  ```

- Option 2: Use Supabase Dashboard SQL Editor:
  - Log in to Supabase Dashboard
  - Navigate to SQL Editor
  - Copy and paste the contents of `src/db/migrations/fix_infinite_recursion_rls.sql`
  - Run the query

### 2. Deploy Code Changes

Deploy the updated code to your hosting provider:

```bash
# Build the project
npm run build

# Deploy (depends on your hosting setup)
npm run deploy
# or
vercel deploy
# or your specific deployment method
```

### 3. Testing

After deployment, test the following flows:

1. User registration and email verification
2. Business profile creation during onboarding
3. Accessing the dashboard with an existing profile
4. Updating business profile information
5. Adding new users to a business profile (if implemented)

### 4. Monitoring

Monitor your application logs for any RLS-related errors. The infinite recursion error should no longer appear, but it's good to confirm this in production.

## Future Recommendations
