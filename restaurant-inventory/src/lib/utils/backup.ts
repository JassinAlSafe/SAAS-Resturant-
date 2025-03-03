import { supabase } from "@/lib/supabase";
import { saveAs } from "file-saver";
import { format } from "date-fns";

/**
 * Creates a backup of all user data
 * @param userId The ID of the user to backup data for
 * @returns Object containing backup data
 */
export async function createBackup(userId: string) {
    try {
        // Fetch all user data
        const [inventoryItems, suppliers, shoppingList, profile, businessProfile] = await Promise.all([
            fetchInventoryItems(userId),
            fetchSuppliers(userId),
            fetchShoppingList(userId),
            fetchProfile(userId),
            fetchBusinessProfile(userId)
        ]);

        // Create backup object
        const backupData = {
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            userId,
            data: {
                inventoryItems,
                suppliers,
                shoppingList,
                profile,
                businessProfile
            }
        };

        // Convert to JSON string
        const backupJson = JSON.stringify(backupData, null, 2);

        // Convert to Blob
        const blob = new Blob([backupJson], { type: "application/json" });

        // Generate filename with timestamp
        const timestamp = format(new Date(), "yyyy-MM-dd-HHmm");
        const filename = `restaurant-backup_${timestamp}.json`;

        // Trigger download
        saveAs(blob, filename);

        return backupData;
    } catch (error) {
        console.error("Error creating backup:", error);
        throw new Error("Failed to create backup");
    }
}

/**
 * Restores data from a backup file
 * @param backupData The backup data to restore
 * @param userId The ID of the user to restore data for
 * @returns Boolean indicating success
 */
export async function restoreFromBackup(backupData: any, userId: string) {
    try {
        // Validate backup data
        if (!backupData || !backupData.version || !backupData.data) {
            throw new Error("Invalid backup file");
        }

        // Version compatibility check
        if (backupData.version !== "1.0.0") {
            console.warn("Backup version mismatch, attempting to restore anyway");
        }

        // Confirm userId matches (security check)
        if (backupData.userId !== userId) {
            throw new Error("Backup belongs to a different user");
        }

        // Begin transaction for atomic restore
        // Note: For a real implementation, you would use a transaction
        // to ensure all operations succeed or fail together

        // Clear existing data
        await clearUserData(userId);

        // Restore each data type
        const { data } = backupData;

        // Restore inventory items
        if (data.inventoryItems && data.inventoryItems.length > 0) {
            await restoreInventoryItems(data.inventoryItems, userId);
        }

        // Restore suppliers
        if (data.suppliers && data.suppliers.length > 0) {
            await restoreSuppliers(data.suppliers, userId);
        }

        // Restore shopping list
        if (data.shoppingList && data.shoppingList.length > 0) {
            await restoreShoppingList(data.shoppingList, userId);
        }

        // Restore business profile
        if (data.businessProfile) {
            await restoreBusinessProfile(data.businessProfile, userId);
        }

        return true;
    } catch (error) {
        console.error("Error restoring backup:", error);
        throw new Error("Failed to restore from backup");
    }
}

// Helper functions for fetching data
async function fetchInventoryItems(userId: string) {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data || [];
}

async function fetchSuppliers(userId: string) {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data || [];
}

async function fetchShoppingList(userId: string) {
    const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data || [];
}

async function fetchProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

async function fetchBusinessProfile(userId: string) {
    const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows returned" error
    return data;
}

// Helper functions for clearing data
async function clearUserData(userId: string) {
    // This would be done in a transaction in a real implementation
    await Promise.all([
        supabase.from('inventory_items').delete().eq('user_id', userId),
        supabase.from('suppliers').delete().eq('user_id', userId),
        supabase.from('shopping_list').delete().eq('user_id', userId),
    ]);
}

// Helper functions for restoring data
async function restoreInventoryItems(items: any[], userId: string) {
    const { error } = await supabase.from('inventory_items').insert(
        items.map(item => ({
            ...item,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))
    );

    if (error) throw error;
}

async function restoreSuppliers(suppliers: any[], userId: string) {
    const { error } = await supabase.from('suppliers').insert(
        suppliers.map(supplier => ({
            ...supplier,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))
    );

    if (error) throw error;
}

async function restoreShoppingList(items: any[], userId: string) {
    const { error } = await supabase.from('shopping_list').insert(
        items.map(item => ({
            ...item,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))
    );

    if (error) throw error;
}

async function restoreBusinessProfile(profile: any, userId: string) {
    // Check if profile exists
    const { data } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (data) {
        // Update existing profile
        const { error } = await supabase
            .from('business_profiles')
            .update({
                ...profile,
                user_id: userId,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) throw error;
    } else {
        // Insert new profile
        const { error } = await supabase
            .from('business_profiles')
            .insert({
                ...profile,
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    }
} 