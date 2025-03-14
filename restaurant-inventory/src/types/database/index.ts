/**
 * Database Types
 * 
 * These types directly reflect the schema in our Supabase database.
 * They use snake_case naming to match the database column names.
 * 
 * DO NOT modify these types unless the database schema changes.
 */

// ShoppingListItem from the database
export type DbShoppingListItem = {
    id: string;
    inventory_item_id?: string;
    name: string;
    quantity: number;
    unit: string;
    estimated_cost: number;
    category?: string;
    notes?: string;
    is_auto_generated: boolean;
    is_purchased: boolean;
    added_at: string;
    purchased_at?: string;
    user_id?: string;
    business_profile_id?: string;
};

// Re-export other database types here as they are added...
// export type DbSupplier = { ... }; 