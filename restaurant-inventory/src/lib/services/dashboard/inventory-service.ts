import { supabase } from "@/lib/supabase/browser-client";
import { inventoryService } from "../inventory-service";
import { CategoryStat, InventoryItem } from "@/lib/types";
import { getBusinessProfileId } from "./profile-service";
import { getRandomChange } from "./utils";
import { InventoryAlert } from "./types";

// Cache implementation for inventory data
interface InventoryCache {
    lowStockItems: {
        data: Array<{ id: string; name: string; quantity: number; reorderLevel: number }>;
        timestamp: number;
        businessProfileId: string | null;
    } | null;
    inventoryValue: {
        data: number;
        timestamp: number;
        businessProfileId: string | null;
    } | null;
    categoryStats: {
        data: CategoryStat[];
        timestamp: number;
        businessProfileId: string | null;
    } | null;
    inventoryAlerts: {
        data: InventoryAlert[];
        timestamp: number;
        businessProfileId: string | null;
    } | null;
}

// Initialize cache
const cache: InventoryCache = {
    lowStockItems: null,
    inventoryValue: null,
    categoryStats: null,
    inventoryAlerts: null
};

// Cache TTL in milliseconds (30 seconds)
const CACHE_TTL = 30000;

// Track the last fetch time for throttling
const lastFetchTimes: Record<string, number> = {};
const MIN_FETCH_INTERVAL = 3000; // 3 seconds minimum between fetches

// Fix the pendingRequests type definition
const pendingRequests: Record<string, Promise<unknown>> = {};

/**
 * Generic request deduplication wrapper
 */
async function deduplicate<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // Check if we need to throttle the request
    const now = Date.now();
    const lastFetchTime = lastFetchTimes[key] || 0;
    if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
        console.log(`Request for ${key} throttled (${now - lastFetchTime}ms since last fetch)`);

        // If we have a cached result, return it instead of making a new request
        if (key.includes('lowStockItems') && cache.lowStockItems) {
            return cache.lowStockItems.data as unknown as T;
        } else if (key.includes('inventoryValue') && cache.inventoryValue) {
            return cache.inventoryValue.data as unknown as T;
        } else if (key.includes('categoryStats') && cache.categoryStats) {
            return cache.categoryStats.data as unknown as T;
        } else if (key.includes('inventoryAlerts') && cache.inventoryAlerts) {
            return cache.inventoryAlerts.data as unknown as T;
        }
    }

    // If there's already a request in progress, return that instead
    if (key in pendingRequests) {
        console.log(`Reusing pending request for ${key}`);
        return pendingRequests[key] as Promise<T>;
    }

    // Create a new promise and track it
    try {
        console.log(`Starting new request for ${key}`);
        lastFetchTimes[key] = now; // Update last fetch time
        pendingRequests[key] = fetchFn();
        const result = await pendingRequests[key];
        return result as T;
    } finally {
        // Always clear the pending request when done
        delete pendingRequests[key];
    }
}

/**
 * Fetch low stock items more reliably by handling comparison in JS
 * Now with caching and request deduplication
 */
export async function fetchLowStockItems(): Promise<{ id: string; name: string; quantity: number; reorderLevel: number }[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) return [];

        // Check cache first
        if (
            cache.lowStockItems &&
            cache.lowStockItems.businessProfileId === businessProfileId &&
            Date.now() - cache.lowStockItems.timestamp < CACHE_TTL
        ) {
            console.log('Using cached low stock items');
            return cache.lowStockItems.data;
        }

        // Use request deduplication
        return await deduplicate(`lowStockItems-${businessProfileId}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<{ id: string; name: string; quantity: number; reorderLevel: number }[]>((_, reject) => {
                setTimeout(() => reject(new Error('Low stock items fetch timed out')), 5000);
            });

            // Actual fetch promise
            const fetchPromise = async () => {
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

                // Update cache
                cache.lowStockItems = {
                    data: lowStockItems,
                    timestamp: Date.now(),
                    businessProfileId
                };

                return lowStockItems;
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error fetching low stock items:', error);

        // Return cached data if available, even if expired
        if (cache.lowStockItems) {
            console.log('Returning cached low stock items after error');
            return cache.lowStockItems.data;
        }

        return [];
    }
}

/**
 * Get the count of low stock items
 * Uses cached data when available
 */
export async function fetchLowStockCount(): Promise<number> {
    try {
        // Try to use cached low stock items first
        if (cache.lowStockItems && Date.now() - cache.lowStockItems.timestamp < CACHE_TTL) {
            console.log('Using cached low stock count');
            return cache.lowStockItems.data.length;
        }

        const lowStockItems = await fetchLowStockItems();
        return lowStockItems.length;
    } catch (error) {
        console.error('Error fetching low stock count:', error);

        // Try to use cached data even if expired
        if (cache.lowStockItems) {
            return cache.lowStockItems.data.length;
        }

        return 0;
    }
}

/**
 * Calculate the total inventory value
 * Now with caching and request deduplication
 */
export async function fetchInventoryValue(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) return 0;

        // Check cache first
        if (
            cache.inventoryValue &&
            cache.inventoryValue.businessProfileId === businessProfileId &&
            Date.now() - cache.inventoryValue.timestamp < CACHE_TTL
        ) {
            console.log('Using cached inventory value');
            return cache.inventoryValue.data;
        }

        // Use request deduplication
        return await deduplicate(`inventoryValue-${businessProfileId}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<number>((_, reject) => {
                setTimeout(() => reject(new Error('Inventory value fetch timed out')), 5000);
            });

            // Actual fetch promise
            const fetchPromise = async () => {
                const { data, error } = await supabase
                    .from('ingredients')
                    .select('quantity, cost')
                    .eq('business_profile_id', businessProfileId);

                if (error) {
                    console.error('Error fetching inventory value:', error);
                    throw error;
                }

                if (!data || data.length === 0) return 0;

                const totalValue = data.reduce((total: number, item: { quantity: number; cost: number }) => {
                    return total + (item.quantity * (item.cost || 0));
                }, 0);

                // Update cache
                cache.inventoryValue = {
                    data: totalValue,
                    timestamp: Date.now(),
                    businessProfileId
                };

                return totalValue;
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error fetching inventory value:', error);

        // Return cached value if available, even if expired
        if (cache.inventoryValue) {
            console.log('Returning cached inventory value after error');
            return cache.inventoryValue.data;
        }

        return 0;
    }
}

/**
 * Fetch inventory category statistics
 * Now with caching and request deduplication
 */
export async function fetchCategoryStats(): Promise<CategoryStat[]> {
    try {
        // We need businessProfileId for cache key
        const businessProfileId = await getBusinessProfileId();

        // Check cache first
        if (
            cache.categoryStats &&
            cache.categoryStats.businessProfileId === businessProfileId &&
            Date.now() - cache.categoryStats.timestamp < CACHE_TTL
        ) {
            console.log('Using cached category stats');
            return cache.categoryStats.data;
        }

        // Use request deduplication
        return await deduplicate(`categoryStats-${businessProfileId || 'none'}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<CategoryStat[]>((_, reject) => {
                setTimeout(() => reject(new Error('Category stats fetch timed out')), 5000);
            });

            // Actual fetch promise
            const fetchPromise = async () => {
                const items = await inventoryService.getItems();

                // If no items found, return default categories
                if (!items || items.length === 0) {
                    const defaultCategories = getDefaultCategories();

                    // Cache the default categories
                    cache.categoryStats = {
                        data: defaultCategories,
                        timestamp: Date.now(),
                        businessProfileId
                    };

                    return defaultCategories;
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
                    const defaultCategories = getDefaultCategories();

                    // Cache the default categories
                    cache.categoryStats = {
                        data: defaultCategories,
                        timestamp: Date.now(),
                        businessProfileId
                    };

                    return defaultCategories;
                }

                const categoryStats = Object.entries(categories).map(([name, data], index) => ({
                    id: index.toString(),
                    name,
                    count: data.count,
                    change: getRandomChange(),
                    iconName: name, // Use the category name itself instead of icon
                    color: colorMap[name] || "bg-gray-500",
                }));

                // Update cache
                cache.categoryStats = {
                    data: categoryStats,
                    timestamp: Date.now(),
                    businessProfileId
                };

                return categoryStats;
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error fetching category stats:', error);

        // Return cached stats if available, even if expired
        if (cache.categoryStats) {
            console.log('Returning cached category stats after error');
            return cache.categoryStats.data;
        }

        // Return default categories if there's an error
        return getDefaultCategories();
    }
}

/**
 * Fetch inventory alerts - low stock and expiring items
 * Now with caching and request deduplication
 */
export async function fetchInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        // Check cache first
        if (
            cache.inventoryAlerts &&
            cache.inventoryAlerts.businessProfileId === businessProfileId &&
            Date.now() - cache.inventoryAlerts.timestamp < CACHE_TTL
        ) {
            console.log('Using cached inventory alerts');
            return cache.inventoryAlerts.data;
        }

        // Use request deduplication
        return await deduplicate(`inventoryAlerts-${businessProfileId}`, async () => {
            // Create a timeout promise
            const timeoutPromise = new Promise<InventoryAlert[]>((_, reject) => {
                setTimeout(() => reject(new Error('Inventory alerts fetch timed out')), 5000);
            });

            // Actual fetch promise
            const fetchPromise = async () => {
                // Use the reliable method to get low stock items
                const lowStockItems = await fetchLowStockItems();

                // Get soon to expire items
                const today = new Date();
                const thresholdDate = new Date();
                thresholdDate.setDate(today.getDate() + 7); // 7 days from now

                try {
                    const { data: expiringItems, error: expiryError } = await supabase
                        .from('ingredients')
                        .select('id, name, quantity, reorder_level, expiry_date')
                        .eq('business_profile_id', businessProfileId)
                        .not('expiry_date', 'is', null)
                        .lte('expiry_date', thresholdDate.toISOString())
                        .order('expiry_date');

                    if (expiryError) {
                        console.error('Error fetching expiring items:', expiryError);
                        const lowStockAlerts = lowStockItems.map(item => ({
                            id: item.id,
                            name: item.name,
                            currentStock: item.quantity,
                            reorderLevel: item.reorderLevel,
                            expiryDate: null,
                            type: 'low_stock' as const
                        }));

                        // Cache even partial results
                        cache.inventoryAlerts = {
                            data: lowStockAlerts,
                            timestamp: Date.now(),
                            businessProfileId
                        };

                        return lowStockAlerts;
                    }

                    // Format low stock alerts
                    const lowStockAlerts: InventoryAlert[] = lowStockItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        currentStock: item.quantity,
                        reorderLevel: item.reorderLevel,
                        expiryDate: null,
                        type: 'low_stock' as const
                    }));

                    // Format expiry alerts
                    const expiryAlerts: InventoryAlert[] = (expiringItems || []).map(item => ({
                        id: item.id,
                        name: item.name,
                        currentStock: item.quantity,
                        reorderLevel: item.reorder_level || 0,
                        expiryDate: item.expiry_date,
                        type: 'expiring' as const
                    }));

                    // Combine both types of alerts
                    const allAlerts = [...lowStockAlerts, ...expiryAlerts];

                    // Update cache
                    cache.inventoryAlerts = {
                        data: allAlerts,
                        timestamp: Date.now(),
                        businessProfileId
                    };

                    return allAlerts;
                } catch (innerError) {
                    console.error('Error fetching expiry alerts:', innerError);

                    // Return just the low stock alerts if expiry fetch fails
                    const lowStockAlerts = lowStockItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        currentStock: item.quantity,
                        reorderLevel: item.reorderLevel,
                        expiryDate: null,
                        type: 'low_stock' as const
                    }));

                    // Cache even partial results
                    cache.inventoryAlerts = {
                        data: lowStockAlerts,
                        timestamp: Date.now(),
                        businessProfileId
                    };

                    return lowStockAlerts;
                }
            };

            // Race between fetch and timeout
            return await Promise.race([fetchPromise(), timeoutPromise]);
        });
    } catch (error) {
        console.error('Error in fetchInventoryAlerts:', error);

        // Return cached alerts if available, even if expired
        if (cache.inventoryAlerts) {
            console.log('Returning cached inventory alerts after error');
            return cache.inventoryAlerts.data;
        }

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