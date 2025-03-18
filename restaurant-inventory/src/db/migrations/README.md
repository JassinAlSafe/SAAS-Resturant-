# Database Migrations

This directory contains SQL migration files for the restaurant inventory management system. These migrations help maintain the database schema and apply necessary changes.

## Migration Files

- `business_profile_rls.sql`: Sets up Row Level Security (RLS) policies for business profiles and related tables
- `fix_restaurant_icons_rls.sql`: Fixes permissions for restaurant icon storage
- Other migration files as needed

## How to Apply Migrations

### Prerequisites

1. You need to have a `.env.local` file with the following environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project
   - `SUPABASE_SERVICE_ROLE_KEY`: The service role key for your Supabase project (this has admin access, keep it secret)

2. Make sure you have the required dependencies installed:
   ```
   npm install dotenv @supabase/supabase-js
   ```

### Running the Migrations

Use the provided migration script to apply all migration files:

```bash
# From project root
node src/scripts/apply-migrations.js
```

This will:

1. Read all `.sql` files in this directory
2. Execute each SQL statement in each file
3. Log the results of each statement execution

## Creating New Migrations

When creating new migration files:

1. Name them descriptively (e.g., `add_inventory_table.sql`)
2. Include clear comments explaining what each migration does
3. Consider dependencies between migrations (they run in alphabetical order)
4. Test migrations on a development database before applying to production

## Troubleshooting

If you encounter errors when running migrations:

1. Check that your Supabase URL and service role key are correct
2. Look for syntax errors in the SQL statements
3. Consider running the statements manually in the Supabase SQL editor to isolate issues
4. Check for permissions issues - the service role key should have admin privileges

For more complex database changes, consider using [Supabase migrations](https://supabase.com/docs/reference/cli/supabase-db-reset) via the Supabase CLI.
