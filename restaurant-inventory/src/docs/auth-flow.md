# Authentication & Onboarding Flow

This document explains the complete authentication and onboarding flow in our restaurant inventory application.

## Overview

The sign-up and onboarding process is structured in several key stages:

1. **User Sign-Up & Email Verification** - Initial user account creation
2. **Email Verification & Session Establishment** - Verifying the user's identity
3. **Onboarding: Business Profile Creation** - Setting up the user's restaurant profile
4. **Dashboard & Ongoing Use** - Accessing the application with proper permissions

## 1. User Sign-Up Process

### Sign-Up Form

- User enters their email, password, and name on the signup page (`/signup`)
- The frontend calls `supabase.auth.signUp()` with these details and a redirect URL
- The system creates a new user in Supabase Auth, but marks them as unverified

### Email Verification

- Supabase sends a verification email containing a link with a secure token
- The link redirects the user to our `/auth/callback` page with the token and email parameters

## 2. Email Verification & Session Establishment

### Callback & Session Handling

- The `/auth/callback` page receives the verification token from the URL
- The page calls `supabase.auth.verifyOtp()` to verify the token
- On successful verification, a session is established and `auth.uid()` becomes available
- We update the user's profile to mark their email as verified

## 3. Onboarding: Business Profile Creation

### Multi-Tenant Security Model

- Each user is associated with one or more business profiles
- Users can only access data related to their business profiles
- RLS (Row Level Security) policies enforce these access restrictions

### Business Profile Creation

- After verification, the user is directed to the onboarding page (`/onboarding`)
- The user enters business details (name, type, contact info, etc.)
- We use a secure SECURITY DEFINER RPC function (`create_business_profile_with_user`) that:
  - Creates a new business profile in the `business_profiles` table
  - Associates the user with this profile in the `business_profile_users` table with 'owner' role
  - Bypasses RLS during creation to ensure proper linking

### Security Considerations

- The RPC function verifies that the calling user can only create a profile for themselves
- All database operations use parameterized inputs to prevent SQL injection
- We implement fallback mechanisms in case the RPC function fails

## 4. Dashboard Access & RLS Enforcement

### Dashboard Access

- After onboarding, the user is redirected to the dashboard
- Their session maintains their authenticated status
- All database queries include business profile filtering

### RLS Policies

- **For business_profiles table**:

  - SELECT: Users can only view profiles they own or are associated with
  - INSERT: Users can only create profiles for themselves
  - UPDATE: Only owners or the creator can update profiles
  - DELETE: Only owners can delete profiles

- **For business_profile_users table**:

  - SELECT: Users can only view their own associations
  - INSERT: Only owners can add new users to their business profile
  - UPDATE: Only owners can change user roles
  - DELETE: Only owners can remove users from their business profile

- **For data tables** (inventory, suppliers, etc.):
  - All tables have RLS policies that filter by business_profile_id
  - Each service module checks the user's business profile before operations

## Technical Implementation Details

### Auth Store & Context

- Our `auth-context.tsx` manages authentication state and operations
- The `signUp()` function handles account creation and initial profile setup
- We utilize a custom hook (`useAuthStore`) to track authentication status

### Business Profile Management

- `businessProfileService` handles profile CRUD operations
- `defaultBusinessProfile` provides initial settings for new restaurants
- We cache business profile data for performance optimization

### Error Handling & Resilience

- All authentication flows include robust error handling
- We implement fallback mechanisms for critical operations
- Detailed logging helps troubleshoot authentication issues

## Flow Sequence Diagram

```
User                 Frontend                Supabase Auth           Database
 |                      |                         |                     |
 | Sign Up Form         |                         |                     |
 |--------------------->|                         |                     |
 |                      | supabase.auth.signUp()  |                     |
 |                      |------------------------>|                     |
 |                      |                         | Create User         |
 |                      |                         |-------------------->|
 |                      |                         | Send Verification   |
 |<--------------------------------------------------------------------|
 |                      |                         |                     |
 | Click Email Link     |                         |                     |
 |--------------------->|                         |                     |
 |                      | auth.verifyOtp()        |                     |
 |                      |------------------------>|                     |
 |                      |                         | Verify User         |
 |                      |                         |-------------------->|
 |                      |                         |                     |
 | Redirect to          |                         |                     |
 | Onboarding           |                         |                     |
 |<---------------------|                         |                     |
 |                      |                         |                     |
 | Enter Business Info  |                         |                     |
 |--------------------->|                         |                     |
 |                      | rpc(create_business_profile_with_user)        |
 |                      |------------------------------------------>   |
 |                      |                         |                     |
 |                      |                         |  Create Profile     |
 |                      |                         |  + Owner Role       |
 |                      |                         |-------------------->|
 |                      |                         |                     |
 | Redirect to          |                         |                     |
 | Dashboard            |                         |                     |
 |<---------------------|                         |                     |
```

## Best Practices & Recommendations

1. **Always verify authentication** before accessing or modifying data
2. **Use RPC functions** for operations that bypass RLS
3. **Implement proper error handling** for all authentication operations
4. **Separate authentication logic** from business logic
5. **Provide clear user feedback** throughout the authentication process
