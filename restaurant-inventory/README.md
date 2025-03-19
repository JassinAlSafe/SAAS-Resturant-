# Restaurant Inventory Management System

A complete restaurant management solution built with Next.js App Router, Supabase, and TypeScript.

## Key Features

- **User Authentication** - Secure email/password sign-up with verification
- **Multi-tenant Architecture** - Each restaurant has its own isolated data
- **Inventory Management** - Track ingredients, costs, and stock levels
- **Supplier Management** - Manage vendors and purchase orders
- **Dashboard & Analytics** - Visual insights into restaurant operations

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Row-Level Security, Authentication)
- **State Management**: React Context, Zustand
- **Styling**: TailwindCSS with custom theming
- **Authentication**: Supabase Auth with email verification

## Architecture

### Authentication & Onboarding Flow

The application implements a secure, multi-step authentication process:

1. **User Sign-Up**

   - User provides email, password, and name
   - Account creation with email verification
   - User data stored in Supabase Auth

2. **Email Verification**

   - Secure verification via email link
   - PKCE flow for secure token exchange
   - Callback handler to establish session

3. **Business Profile Creation**

   - New users create their restaurant profile
   - Secure RPC function assigns owner privileges
   - Data isolation through business_profile_id

4. **Multi-tenant Data Access**
   - Row-Level Security ensures data isolation
   - Each query filtered by business_profile_id
   - Owner/staff role-based permissions

See [Authentication Flow Documentation](src/docs/auth-flow.md) for detailed implementation.

### Security Model

The application uses Supabase Row-Level Security (RLS) policies for data isolation:

- **Row-Level Security**: Each table has RLS policies that filter data by business_profile_id
- **Role-Based Access**: Different permissions for owners vs. staff members
- **Secure RPC Functions**: SECURITY DEFINER functions for operations that bypass RLS
- **Authentication State**: Verified through getUser() before sensitive operations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/restaurant-inventory.git
   cd restaurant-inventory
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
restaurant-inventory/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Authentication routes (login, signup, etc.)
│   │   ├── (dashboard)/   # Protected dashboard routes
│   │   └── api/           # API routes
│   ├── components/        # React components
│   ├── lib/               # Shared utilities
│   │   ├── services/      # Business logic services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── stores/        # State management
│   ├── db/                # Database migrations and schema
│   └── styles/            # Global styles
├── public/                # Static assets
└── ...config files
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
