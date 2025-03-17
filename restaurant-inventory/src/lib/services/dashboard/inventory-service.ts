import { supabase } from "@/lib/supabase";
import { inventoryService } from "../inventory-service";
import { CategoryStat, InventoryItem } from "@/lib/types";
import { getBusinessProfileId } from "./profile-service";
import { getRandomChange } from "./utils";
import { InventoryAlert } from "./types";

/**
 * Fetch low stock items more reliably by handling comparison in JS
 */
export async function fetchLowStockItems(): Promise<{ id: string; name: string; quantity: number; reorderLevel: number }[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) return [];

        // Get all ingredients with non-null reorder_level
        const { data, error } = await supabase
            .from('ingredients')
            .select('id, name, quantity, reorder_level')
            .eq('business_profile_id', businessProfileId)
            .not('reorder_level', 'is', null)
            .order('name');

        if (error) {
            console.error('Error fetching ingredients:', error);
            throw error;
        }

        // Filter low stock items in JavaScript
        const lowStockItems = data
            .filter(item => typeof item.quantity === 'number' &&
                typeof item.reorder_level === 'number' &&
                item.quantity < item.reorder_level)
            .map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                reorderLevel: item.reorder_level
            }));

        return lowStockItems;
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        return [];
    }
}

/**
 * Get the count of low stock items
 */
export async function fetchLowStockCount(): Promise<number> {
    try {
        const lowStockItems = await fetchLowStockItems();
        return lowStockItems.length;
    } catch (error) {
        console.error('Error fetching low stock count:', error);
        return 0;
    }
}

/**
 * Calculate the total inventory value
 */
export async function fetchInventoryValue(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) return 0;

        const { data, error } = await supabase
            .from('ingredients')
            .select('quantity, cost')
            .eq('business_profile_id', businessProfileId);

        if (error) {
            console.error('Error fetching inventory value:', error);
            return 0;
        }

        if (!data || data.length === 0) return 0;

        return data.reduce((total: number, item: { quantity: number; cost: number }) => {
            return total + (item.quantity * (item.cost || 0));
        }, 0);
    } catch (error) {
        console.error('Error fetching inventory value:', error);
        return 0;
    }
}

/**
 * Fetch inventory category statistics
 */
export async function fetchCategoryStats(): Promise<CategoryStat[]> {
    try {
        const items = await inventoryService.getItems();

        // If no items found, return default categories
        if (!items || items.length === 0) {
            return getDefaultCategories();
        }

        // Group items by category
        const categories: {
            [key: string]: { count: number; items: InventoryItem[] };
        } = {};

        items.forEach((item) => {
            if (!categories[item.category]) {
                categories[item.category] = { count: 0, items: [] };
            }
            categories[item.category].count += 1;
            categories[item.category].items.push(item);
        });

        // Assign appropriate colors
        const colorMap: { [key: string]: string } = {
            "Meat": "bg-primary",
            "Produce": "bg-green-500",
            "Dairy": "bg-blue-500",
            "Dry Goods": "bg-amber-500",
            "Seafood": "bg-purple-500",
        };

        if (Object.keys(categories).length === 0) {
            return getDefaultCategories();
        }

        return Object.entries(categories).map(([name, data], index) => ({
            id: index.toString(),
            name,
            count: data.count,
            change: getRandomChange(),
            iconName: name, // Use the category name itself instead of icon
            color: colorMap[name] || "bg-gray-500",
        }));
    } catch (error) {
        console.error('Error fetching category stats:', error);
        // Return default categories if there's an error
        return getDefaultCategories();
    }
}

/**
 * Fetch inventory alerts - low stock and expiring items
 */
export async function fetchInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        // Use the reliable method to get low stock items
        const lowStockItems = await fetchLowStockItems();

        // Get soon to expire items
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + 7); // 7 days from now

        const { data: expiringItems, error: expiryError } = await supabase
            .from('ingredients')
            .select('id, name, quantity, reorder_level, expiry_date')
            .eq('business_profile_id', businessProfileId)
            .not('expiry_date', 'is', null)
            .lte('expiry_date', thresholdDate.toISOString())
            .order('expiry_date');

        if (expiryError) {
            console.error('Error fetching expiring items:', expiryError);
            return lowStockItems.map(item => ({
                id: item.id,
                name: item.name,
                currentStock: item.quantity,
                reorderLevel: item.reorderLevel,
                expiryDate: null,
                type: 'low_stock'
            }));
        }

        // Format low stock alerts
        const lowStockAlerts: InventoryAlert[] = lowStockItems.map(item => ({
            id: item.id,
            name: item.name,
            currentStock: item.quantity,
            reorderLevel: item.reorderLevel,
            expiryDate: null,
            type: 'low_stock'
        }));

        // Format expiry alerts
        const expiryAlerts: InventoryAlert[] = (expiringItems || []).map(item => ({
            id: item.id,
            name: item.name,
            currentStock: item.quantity,
            reorderLevel: item.reorder_level || 0,
            expiryDate: item.expiry_date,
            type: 'expiring'
        }));

        // Combine both types of alerts
        return [...lowStockAlerts, ...expiryAlerts];
    } catch (error) {
        console.error('Error in fetchInventoryAlerts:', error);
        return [];
    }
}

/**
 * Generate default category stats when no data is available
 */
function getDefaultCategories(): CategoryStat[] {
    return [
        { id: "1", name: "Meat", count: 0, change: 0, iconName: "Meat", color: "bg-primary" },
        { id: "2", name: "Produce", count: 0, change: 0, iconName: "Produce", color: "bg-green-500" },
        { id: "3", name: "Dairy", count: 0, change: 0, iconName: "Dairy", color: "bg-blue-500" },
        { id: "4", name: "Dry Goods", count: 0, change: 0, iconName: "Dry Goods", color: "bg-amber-500" },
        { id: "5", name: "Seafood", count: 0, change: 0, iconName: "Seafood", color: "bg-purple-500" }
    ];
} 