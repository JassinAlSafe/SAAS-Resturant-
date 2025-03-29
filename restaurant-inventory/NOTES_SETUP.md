# Notes Feature Setup

This document explains how to set up the restaurant inventory management system's Notes feature with Supabase.

## Database Tables Setup

To use the notes feature with your Supabase database, you need to create the following tables and policies.
You can run the SQL commands in the SQL editor of your Supabase project.

### 1. Run the SQL Migration

Copy and paste the contents of `notes_migration.sql` into the Supabase SQL Editor and run it. This will:

1. Create a `notes` table for storing notes
2. Create a `note_tags` table for storing note tags
3. Enable Row Level Security (RLS) on both tables
4. Create appropriate RLS policies to ensure users can only access notes for their own business profiles

### 2. Add Seed Data (Optional)

To add initial seed data for note tags:

1. Copy and paste the contents of `notes_seed_data.sql` into the Supabase SQL Editor
2. Run the script to add a variety of pre-defined tags for all business profiles

This step is optional but recommended for a better initial user experience.

### 3. Integrate with Your Frontend

The notes feature has already been integrated with the frontend using the Supabase client.
The implementation can be found in:

- `src/lib/services/notes-service-supabase.ts` - Service for interacting with Supabase
- `src/app/(protected)/notes/page.tsx` - Notes page component

## Features

The notes system provides the following features:

1. **Create, Read, Update, Delete (CRUD) operations for notes**:

   - Add new notes with content, tags, and entity references
   - View existing notes with filtering and sorting
   - Update note content and metadata
   - Delete notes

2. **Tag Management**:

   - Create and manage colored tags for categorizing notes
   - Filter notes by tags

3. **Entity References**:

   - Associate notes with specific entities like inventory items, suppliers, or sales
   - Filter notes by entity type

4. **Business Profile Scoping**:
   - Notes are scoped to specific business profiles
   - Multiple users within the same business can access shared notes

## Security

The implementation includes:

- **Row Level Security**: Users can only access notes associated with business profiles they're members of
- **Proper authentication**: All API calls include authentication to verify the user's identity
- **Error handling**: Comprehensive error handling for a robust user experience

## Usage

To start using the notes feature:

1. Navigate to the Notes page in the application
2. Use the "Add Note" button to create new notes
3. Apply filters and use the search functionality to find specific notes
4. Create tags to help categorize your notes

## Troubleshooting

If you encounter issues:

1. Check that the tables have been created correctly in your Supabase database
2. Verify that the RLS policies are properly configured
3. Check the browser console for any error messages
4. Ensure the user has the correct permissions in the business profile

## Fallback to Mock Data

If you don't have access to Supabase or prefer to use mock data for development:

1. Import from the mock service instead:

   ```typescript
   import { notesService } from "@/lib/services/notes-service";
   ```

2. This will use predefined mock data and simulate API calls with timeouts.
