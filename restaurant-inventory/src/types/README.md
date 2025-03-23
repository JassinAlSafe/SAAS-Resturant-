# Type System Documentation

## Overview

This directory contains the unified type system for the Restaurant Inventory Management application. It aims to solve the problem of having multiple, potentially conflicting type definitions by:

1. Providing a single source of truth for all types
2. Clear separation between database types and application types
3. Adapter functions to convert between them

## Directory Structure

```
/src/types/
 README.md              # This documentation file
 index.ts               # Main entry point for types
 database/              # Database schema types (snake_case)
    index.ts
 app/                   # Application types (camelCase)
    index.ts
 adapters/              # Functions to convert between types
     index.ts
     shopping-list.ts   # Adapters for shopping list types
```

## Usage Guidelines

### Importing Types

Always import types from the main types index:

```typescript
// Good - unified type system
import { ShoppingListItem, adapters } from "@/types";

// Bad - importing directly from individual files
import { ShoppingListItem } from "@/types/app";
```

### Database vs. Application Types

- **Database Types**: Use the `DbShoppingListItem` type (and similar) when working directly with the database (Supabase).
- **Application Types**: Use the `ShoppingListItem` type (and similar) in UI components and business logic.

### Working with APIs

When fetching data from the API:

```typescript
import { ShoppingListItem, adapters, dbTypes } from "@/types";

async function fetchItems(): Promise<ShoppingListItem[]> {
  const { data } = await supabase.from("shopping_list").select("*");
  return adapters.dbToAppShoppingListItems(
    data as dbTypes.DbShoppingListItem[]
  );
}
```

When sending data to the API:

```typescript
import { ShoppingListItem, adapters } from "@/types";

async function createItem(item: ShoppingListItem): Promise<ShoppingListItem> {
  const dbItem = adapters.appToDbShoppingListItem(item);
  const { data } = await supabase.from("shopping_list").insert(dbItem).single();
  return adapters.dbToAppShoppingListItem(data);
}
```

## Type Conventions

- **Database Types**: Use `snake_case` for property names to match Supabase column names
- **Application Types**: Use `camelCase` for property names to follow JavaScript conventions
- **Adapters**: Follow the naming pattern `dbToApp[TypeName]` and `appToDb[TypeName]`

## Adding New Types

1. Add the database type to `src/types/database/index.ts`
2. Add the application type to `src/types/app/index.ts`
3. Create adapter functions in `src/types/adapters/[type-name].ts`
4. Re-export the adapter functions from `src/types/adapters/index.ts`

## Benefits

- **Type Safety**: Clear typings for both database and application
- **Consistency**: Unified naming conventions
- **Maintainability**: Changes to database schema only need to be updated in one place
- **Development Speed**: Easy to understand and navigate type system
