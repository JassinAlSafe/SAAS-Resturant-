# Restaurant Inventory Management System - Technical Manual

## System Architecture

### Tech Stack Overview

- **Frontend**:

  - Next.js 14 (App Router)
  - React 18
  - TypeScript 5
  - TailwindCSS 3
  - Shadcn UI (Radix UI based components)
  - Zustand (State Management)
  - React Query (Server State Management)

- **Backend & Database**:

  - Supabase (PostgreSQL)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage for images

- **Authentication**:

  - Supabase Auth
  - PKCE Flow
  - Email verification
  - Session management

- **Deployment**:
  - Vercel (Frontend)
  - Supabase (Backend)

## Project Structure

```
restaurant-inventory/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (protected)/       # Protected routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utility functions and services
│   │   ├── services/         # Business logic services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   └── styles/              # Global styles
├── public/                  # Static files
└── supabase/               # Supabase configurations
    └── migrations/         # Database migrations
```

## Authentication System

### 1. Authentication Flow

The system uses Supabase's PKCE (Proof Key for Code Exchange) authentication flow:

1. **Sign Up Process**:

   ```typescript
   // src/lib/auth-context.tsx
   const signUp = async (email, password, name) => {
     const redirectUrl = new URL("/auth/callback", window.location.origin);
     redirectUrl.searchParams.append("type", "signup");

     await supabase.auth.signUp({
       email,
       password,
       options: {
         data: { name },
         emailRedirectTo: redirectUrl.toString(),
       },
     });
   };
   ```

2. **Email Verification**:

   - Verification link sent to user's email
   - Link contains PKCE code
   - Callback page handles verification
   - Profile created upon successful verification

3. **Session Management**:
   - Sessions stored in localStorage
   - Automatic token refresh
   - Real-time session updates

### 2. Database Schema

#### Users and Profiles

```sql
-- auth.users table (managed by Supabase)
-- profiles table (custom)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  name text,
  role text default 'staff',
  email_confirmed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- business_profiles table
create table business_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  business_name text,
  business_type text,
  contact_email text,
  contact_phone text,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_user_business unique (user_id)
);
```

#### Inventory Management

```sql
-- dishes table
create table dishes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- sales table
create table sales (
  id uuid primary key default uuid_generate_v4(),
  dish_id uuid references dishes on delete restrict,
  quantity integer not null default 0,
  total_amount numeric not null default 0,
  date date not null default current_date,
  user_id uuid references auth.users on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Staff can view all sales"
ON sales FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18.17 or later
- npm 9+ or yarn 1.22+
- PostgreSQL 14+ (handled by Supabase)
- Git

### 2. Environment Variables

Create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Additional Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_STORAGE=true
```

### 3. Database Setup

1. Create Supabase project
2. Run migrations:
   ```bash
   cd supabase
   supabase db push
   ```
3. Set up RLS policies:
   ```bash
   supabase db remote commit
   ```

### 4. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Key Features Implementation

### 1. State Management

Using Zustand for client-side state:

```typescript
// src/lib/stores/useStore.ts
import create from "zustand";

interface AppState {
  // State definition
}

export const useStore = create<AppState>((set) => ({
  // State implementation
}));
```

### 2. API Integration

Using React Query for server state:

```typescript
// src/lib/hooks/useQuery.ts
import { useQuery } from "@tanstack/react-query";

export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: fetchSales,
  });
};
```

### 3. Real-time Updates

Using Supabase subscriptions:

```typescript
// src/lib/supabase-realtime.ts
supabase
  .channel("sales")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "sales",
    },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Clear browser cache and cookies
   - Check PKCE flow implementation
   - Verify environment variables

2. **Database Access Issues**

   - Verify RLS policies
   - Check user roles and permissions
   - Validate SQL queries

3. **Performance Issues**
   - Implement proper indexing
   - Use query optimization
   - Enable edge caching

## Security Considerations

1. **Authentication**

   - PKCE flow for secure authentication
   - Session management
   - Password policies

2. **Database**

   - Row Level Security (RLS)
   - Prepared statements
   - Input validation

3. **API**
   - Rate limiting
   - Request validation
   - Error handling

## Maintenance

### Regular Tasks

1. Update dependencies
2. Monitor error logs
3. Backup database
4. Check security updates

### Monitoring

1. Implement error tracking
2. Monitor performance metrics
3. Track user analytics

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
