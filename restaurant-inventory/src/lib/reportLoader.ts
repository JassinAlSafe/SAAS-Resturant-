/**
 * Utility for prefetching report data
 */
import { generateSalesData, generateTopDishesData, generateInventoryData } from "../app/(protected)/reports/utils/mockDataGenerators";
import { DateRange } from "react-day-picker";

// Cache for storing prefetched data
const dataCache = new Map();

// Generate a cache key from parameters
const getCacheKey = (type: string, dateRange: DateRange) => {
    const from = dateRange.from ? dateRange.from.toISOString() : 'undefined';
    const to = dateRange.to ? dateRange.to.toISOString() : 'undefined';
    return `${type}-${from}-${to}`;
};

// Prefetch data and store in cache
export const prefetchReportData = async (type: 'sales' | 'inventory', dateRange: DateRange): Promise<void> => {
    const cacheKey = getCacheKey(type, dateRange);

    // Check if data is already in cache
    if (dataCache.has(cacheKey)) return;

    // Generate data based on type
    let data;
    if (type === 'sales') {
        data = {
            sales: generateSalesData(dateRange),
            topDishes: generateTopDishesData()
        };
    } else {
        data = generateInventoryData(dateRange);
    }

    // Store in cache
    dataCache.set(cacheKey, data);

    // Log for debugging
    console.log(`Prefetched ${type} data for range: ${dateRange.from} to ${dateRange.to}`);
};

// Get data from cache or generate if not available
export const getReportData = async (type: 'sales' | 'inventory', dateRange: DateRange): Promise<any> => {
    const cacheKey = getCacheKey(type, dateRange);

    // Return from cache if available
    if (dataCache.has(cacheKey)) {
        return dataCache.get(cacheKey);
    }

    // Otherwise generate and cache
    await prefetchReportData(type, dateRange);
    return dataCache.get(cacheKey);
};

// Clear cache for specific type and range
export const invalidateCache = (type?: 'sales' | 'inventory', dateRange?: DateRange): void => {
    if (!type && !dateRange) {
        // Clear entire cache
        dataCache.clear();
        return;
    }

    if (type && !dateRange) {
        // Clear all entries for specific type
        for (const key of dataCache.keys()) {
            if (key.startsWith(type)) {
                dataCache.delete(key);
            }
        }
        return;
    }

    if (type && dateRange) {
        // Clear specific entry
        const cacheKey = getCacheKey(type, dateRange);
        dataCache.delete(cacheKey);
    }
};
