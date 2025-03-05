# Restaurant Inventory Management System

A comprehensive inventory management system for restaurants, built with Next.js, TypeScript, and Supabase.

## Features

### Inventory Management

- Track inventory items with detailed information (name, category, quantity, unit, reorder level, cost)
- Add, edit, and delete inventory items
- Filter and search inventory items
- Low stock alerts for items below reorder levels

### NEW: Expiry Date Tracking

- Track expiry dates for perishable inventory items
- Dashboard widget showing expired and soon-to-expire items
- Color-coded alerts based on expiry timeframe (expired, critical, warning)
- Quick navigation to manage expiring items

### NEW: Supplier Management

- Maintain a database of suppliers with contact information
- Associate inventory items with specific suppliers
- Add, edit, and delete supplier records
- Search and filter supplier information

### Recipe Management

- Create and manage recipes with ingredient requirements
- Calculate recipe costs based on ingredient prices
- Track recipe usage and popularity

### Sales Tracking

- Record sales data for menu items
- View sales trends and analytics
- Generate reports on popular items and revenue

### User Management

- Role-based access control (admin, manager, staff)
- Secure authentication with Supabase Auth
- User profile management

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context API
- **Styling**: TailwindCSS with custom components
- **Deployment**: Vercel

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- `ingredients`: Stores inventory items with quantities, costs, categories, expiry dates, and supplier references
- `suppliers`: Stores supplier information including contact details
- `recipes`: Stores recipe information
- `recipe_ingredients`: Junction table for recipe-ingredient relationships
- `sales`: Records sales data

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/restaurant-inventory.git
cd restaurant-inventory
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Chart.js](https://www.chartjs.org/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [next-themes](https://github.com/pacocoursey/next-themes)

# Sales Table Schema Fix

## Issue

The application was trying to insert a `dish_name` column into the `sales` table, but this column doesn't exist in the database schema, resulting in the error:

```
Could not find the 'dish_name' column of 'sales' in the schema cache (Code: PGRST204)
```

## Changes Made

1. Updated the `addSales` function in `src/lib/services/sales-service.ts` to:

   - Remove the `dish_name` field from the database entries
   - Fetch dish names from the dishes table after inserting sales records
   - Update the `SaleRecord` interface to match the actual database schema

2. Created a migration file `supabase/migrations/20240601_update_sales_table.sql` to:

   - Add the `user_id` column to the sales table
   - Add the `updated_at` column for consistency
   - Create a trigger to update the `updated_at` column automatically

3. Updated the `getDishes` function to handle both the `dishes` and `recipes` tables

4. Created a migration file `supabase/migrations/20240602_ensure_dishes_data.sql` to:
   - Ensure the dishes table exists
   - Copy data from the recipes table to the dishes table if it exists
   - Create sample dishes if the table is empty
   - Set up proper indexes and RLS policies

## How to Apply the Fix

1. Apply the migrations to your Supabase database:

   ```bash
   npx supabase migration up
   ```

   If you're using the Supabase cloud, you can run the SQL in the migration files directly in the SQL editor.

2. Restart your application to use the updated code.

## Database Schema

The updated `sales` table schema should look like this:

```sql
create table if not exists public.sales (
  id uuid default uuid_generate_v4() primary key,
  dish_id uuid references public.dishes on delete restrict not null,
  quantity integer not null default 0,
  total_amount numeric not null default 0,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete set null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

The `dishes` table schema should look like this:

```sql
create table if not exists public.dishes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```
