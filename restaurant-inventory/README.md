# Restaurant Inventory Management System

A modern inventory management system for restaurants built with Next.js, Supabase, and Clerk Authentication.

## Features

- **Inventory Management**: Track ingredients, stock levels, and usage
- **Sales Tracking**: Record daily sales and analyze trends
- **Reports & Analytics**: Generate insights from your restaurant data
- **User Authentication**: Secure login with role-based access control

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Clerk account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/restaurant-inventory.git
   cd restaurant-inventory
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Clerk credentials

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

This project uses Supabase as the database. The SQL migrations are located in the `supabase/migrations` directory.

To set up the database:

1. Create a new Supabase project
2. Run the migrations in the Supabase SQL editor
3. Update your environment variables with the Supabase URL and anon key

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
