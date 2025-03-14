import { supabase } from "@/lib/supabase";
import { ShoppingListItem } from "@/lib/types";

export async function fetchShoppingList(businessProfileId: string) {
    try {
        // First try with business_profile_id filter
        const { data, error } = await supabase
            .from("shopping_list")
            .select(`
                id,
                name,
                quantity,
                unit,
                category,
                estimated_cost,
                is_auto_generated,
                is_purchased,
                inventory_item_id,
                added_at,
                purchased_at,
                user_id
            `)
            .eq("business_profile_id", businessProfileId)
            .order("added_at", { ascending: false });

        if (error) {
            console.warn("Error fetching shopping list with business_profile_id:", error.message);

            // Fallback to fetching without business_profile_id filter
            const { data: fallbackData, error: fallbackError } = await supabase
                .from("shopping_list")
                .select(`
                    id,
                    name,
                    quantity,
                    unit,
                    category,
                    estimated_cost,
                    is_auto_generated,
                    is_purchased,
                    inventory_item_id,
                    added_at,
                    purchased_at,
                    user_id
                `)
                .order("added_at", { ascending: false });

            if (fallbackError) {
                console.error("Error in fallback fetchShoppingList:", fallbackError.message);
                return [];
            }

            return fallbackData as ShoppingListItem[];
        }

        return data as ShoppingListItem[];
    } catch (err) {
        console.error("Error in fetchShoppingList:", err);
        return [];
    }
}

export async function createShoppingItem(
    item: Omit<ShoppingListItem, "id" | "added_at" | "purchased_at">,
    businessProfileId: string
) {
    try {
        // Prepare the item data
        const itemData = {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            estimated_cost: item.estimated_cost,
            is_auto_generated: item.is_auto_generated ?? false,
            is_purchased: item.is_purchased ?? false,
            inventory_item_id: item.inventory_item_id || null,
            user_id: item.user_id,
            business_profile_id: businessProfileId,
            added_at: new Date().toISOString()
        };

        // First try with business_profile_id field
        const { data, error } = await supabase
            .from("shopping_list")
            .insert([itemData])
            .select()
            .single();

        if (error) {
            console.warn("Error creating shopping item with business_profile_id:", error.message);

            // Try again without business_profile_id if that field doesn't exist
            const { name, quantity, unit, category, estimated_cost, is_auto_generated, is_purchased, inventory_item_id, user_id, added_at } = itemData;
            const fallbackData = { name, quantity, unit, category, estimated_cost, is_auto_generated, is_purchased, inventory_item_id, user_id, added_at };

            const { data: fallbackItem, error: fallbackError } = await supabase
                .from("shopping_list")
                .insert([fallbackData])
                .select()
                .single();

            if (fallbackError) {
                throw new Error(fallbackError.message);
            }

            return fallbackItem;
        }

        return data;
    } catch (err) {
        console.error("Error in createShoppingItem:", err);
        throw err;
    }
}

export async function updateShoppingItem(
    id: string,
    updates: Partial<Omit<ShoppingListItem, "id" | "added_at" | "purchased_at">>,
    businessProfileId: string
) {
    const updateData = {
        ...updates,
        ...(updates.is_purchased && { purchased_at: new Date().toISOString() })
    };

    const { data, error } = await supabase
        .from("shopping_list")
        .update(updateData)
        .eq("id", id)
        .eq("business_profile_id", businessProfileId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteShoppingItem(id: string, businessProfileId: string) {
    const { error } = await supabase
        .from("shopping_list")
        .delete()
        .eq("id", id)
        .eq("business_profile_id", businessProfileId);

    if (error) throw new Error(error.message);
    return true;
}

export async function markItemAsPurchased(
    id: string,
    isPurchased: boolean,
    businessProfileId: string
) {
    const { data, error } = await supabase
        .from("shopping_list")
        .update({
            is_purchased: isPurchased,
            purchased_at: isPurchased ? new Date().toISOString() : null
        })
        .eq("id", id)
        .eq("business_profile_id", businessProfileId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function fetchCategories(businessProfileId: string) {
    try {
        // First attempt to get categories from ingredients table
        const { data, error } = await supabase
            .from("ingredients")
            .select("category")
            .eq("business_profile_id", businessProfileId)
            .order("category");

        if (error) {
            console.warn("Error fetching categories from ingredients:", error.message);

            // If that fails, return a default set of categories
            return [
                "Meat",
                "Seafood",
                "Produce",
                "Dairy",
                "Dry Goods",
                "Bakery",
                "Beverages",
                "Other"
            ];
        }

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];

        // If no categories found, return defaults
        if (!uniqueCategories.length) {
            return [
                "Meat",
                "Seafood",
                "Produce",
                "Dairy",
                "Dry Goods",
                "Bakery",
                "Beverages",
                "Other"
            ];
        }

        return uniqueCategories;
    } catch (err) {
        console.error("Error in fetchCategories:", err);
        // Return default categories as fallback
        return [
            "Meat",
            "Seafood",
            "Produce",
            "Dairy",
            "Dry Goods",
            "Bakery",
            "Beverages",
            "Other"
        ];
    }
}

export async function generateShoppingList(businessProfileId: string) {
    const { data, error } = await supabase
        .rpc("generate_shopping_list", { business_profile_id: businessProfileId });

    if (error) throw new Error(error.message);
    return data;
} 