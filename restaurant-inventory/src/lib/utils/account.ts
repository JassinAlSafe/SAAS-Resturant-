import { supabase } from "@/lib/supabase";

/**
 * Delete all user data and account
 * @param userId The ID of the user to delete
 * @returns Boolean indicating success
 */
export async function deleteAccount(userId: string): Promise<boolean> {
    try {
        // Delete user data from all tables
        await Promise.all([
            // Delete from inventory_items
            supabase.from('inventory_items').delete().eq('user_id', userId),

            // Delete from suppliers
            supabase.from('suppliers').delete().eq('user_id', userId),

            // Delete from shopping_list
            supabase.from('shopping_list').delete().eq('user_id', userId),

            // Delete from business_profiles
            supabase.from('business_profiles').delete().eq('user_id', userId),

            // Delete from profiles
            supabase.from('profiles').delete().eq('id', userId)
        ]);

        // Delete the auth user (requires admin rights)
        // Note: In Supabase, this typically requires a server-side function with admin rights
        // For a complete implementation, you would need to call a server function
        // that has the necessary permissions

        return true;
    } catch (error) {
        console.error("Error deleting account:", error);
        throw new Error("Failed to delete account");
    }
} 