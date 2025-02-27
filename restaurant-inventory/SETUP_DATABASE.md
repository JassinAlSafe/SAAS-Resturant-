# Setting Up Your Supabase Database

This guide will help you set up the necessary tables and security policies in your Supabase database for the Restaurant Inventory Management System.

## Prerequisites

1. A Supabase account and project
2. Access to the Supabase dashboard for your project

## Steps to Set Up the Database

### 1. Access the SQL Editor

1. Log in to your Supabase dashboard
2. Select your project
3. In the left sidebar, click on "SQL Editor"
4. Click "New query" to create a new SQL query

### 2. Execute the Schema SQL

Copy the entire contents of the `src/lib/supabase-schema.sql` file and paste it into the SQL editor. The schema includes:

- Profiles table (for users)
- Ingredients table
- Dishes table
- Dish Ingredients junction table
- Sales table
- Indexes for performance
- Functions for inventory management
- Row Level Security (RLS) policies
- Triggers for timestamp management

### 3. Run the SQL Query

Click the "Run" button to execute the SQL query. This will create all the necessary tables, functions, and policies.

### 4. Verify the Setup

After running the query, you can verify that everything was set up correctly:

1. Go to the "Table Editor" in the left sidebar
2. You should see the following tables:
   - profiles
   - ingredients
   - dishes
   - dish_ingredients
   - sales

## Troubleshooting

If you encounter any errors when running the SQL:

1. **UUID Extension**: If you see an error about the UUID functions, you may need to enable the UUID extension first:

   ```sql
   create extension if not exists "uuid-ossp";
   ```

2. **Existing Tables**: If tables already exist, you might see errors. The schema uses `if not exists` clauses, but if you need to start fresh, you can drop the existing tables first:

   ```sql
   drop table if exists public.sales;
   drop table if exists public.dish_ingredients;
   drop table if exists public.dishes;
   drop table if exists public.ingredients;
   drop table if exists public.profiles;
   ```

3. **RLS Policies**: If you see errors about existing policies, you may need to drop them first:
   ```sql
   drop policy if exists "Users can view their own profile" on public.profiles;
   -- Repeat for other policies
   ```

## Next Steps

After setting up the database, you should be able to:

1. Register users (which will automatically create profiles)
2. Add ingredients, dishes, and sales records
3. Use all the features of the Restaurant Inventory Management System

If you're still experiencing issues with the profile creation, check the browser console for specific error messages that might provide more details about what's going wrong.
