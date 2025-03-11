# Database Migrations

This directory contains SQL migration files for the database schema.

## Running Migrations

To run a migration, you can use the Supabase CLI or execute the SQL directly in the Supabase dashboard SQL editor.

### Using Supabase CLI

```bash
supabase db push
```

### Using Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

## Migration Files

- `add_image_url_to_ingredients.sql` - Adds the `image_url` column to the `ingredients` table to support image URLs for inventory items.
