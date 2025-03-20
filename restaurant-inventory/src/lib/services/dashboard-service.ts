import {
    fetchMonthlySales,
    fetchSalesGrowth,
    fetchRecentSales,
    fetchTopSellingItems
} from "./dashboard/sales-service";
import {
    fetchLowStockCount,
    fetchInventoryValue,
    fetchCategoryStats,
    fetchInventoryAlerts
} from "./dashboard/inventory-service";
import { fetchRecentActivity } from "./dashboard/activity-service";
import { getBusinessProfileId } from "./dashboard/profile-service";
import { CategoryStat } from "@/lib/types";
import { ActivityItem, InventoryAlert, RecentSale } from "./dashboard/types";

// Keep track of active fetch to prevent multiple simultaneous requests
let activeFetchPromise: Promise<unknown> | null = null;

// Track last fetch time for throttling
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 10000; // Increase to 10 seconds minimum between fetch attempts to reduce load

// Define the dashboard data type
interface DashboardData {
    salesData: {
        currentMonthSales: number;
        monthlySalesData: { month: string; sales: number }[];
        salesGrowth: number;
    };
    stats: {
        totalInventoryValue: number;
        lowStockItems: number;
        monthlySales: number;
        salesGrowth: number;
        categoryStats: CategoryStat[];
    };
    recentActivity: ActivityItem[];
    recentSales: RecentSale[];
    topSellingItems: { name: string; quantity: number }[];
    inventoryAlerts: InventoryAlert[];
    lastUpdated: string;
}

// Cache for dashboard data
let dashboardCache: {
    data: DashboardData;
    timestamp: number;
    businessProfileId: string | null;
} | null = null;

// Cache TTL in milliseconds (30 seconds)
const CACHE_TTL = 30000;

/**
 * Main service for fetching all dashboard data
 */
export const dashboardService = {
    /**
     * Fetch all dashboard data with deduplication
     */
    async fetchDashboardData(): Promise<DashboardData> {
        try {
            // First, get the business profile ID to check if cache is valid
            const businessProfileId = await getBusinessProfileId();
            
            // Check if we have valid cached data for this business profile
            if (
                dashboardCache &&
                dashboardCache.businessProfileId === businessProfileId &&
                Date.now() - dashboardCache.timestamp < CACHE_TTL
            ) {
                console.log('Using cached dashboard data');
                return dashboardCache.data;
            }
            
            // Check if we're fetching too frequently
            const now = Date.now();
            if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
                console.log(`Fetch attempted too soon (${now - lastFetchTime}ms since last fetch), throttling`);
                
                // If there's an active fetch, return that instead
                if (activeFetchPromise) {
                    console.log('Returning existing fetch promise');
                    return activeFetchPromise as Promise<DashboardData>;
                }
                
                // If we have cached data (even if for a different business), return it
                if (dashboardCache) {
                    console.log('Returning cached dashboard data during throttling');
                    return dashboardCache.data;
                }
                
                // Otherwise wait for the minimum interval before allowing a new fetch
                await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL - (now - lastFetchTime)));
            }

            // If there's already an active fetch, return that promise instead of starting a new one
            if (activeFetchPromise) {
                console.log('Another fetch is already in progress, returning that promise');
                return activeFetchPromise as Promise<DashboardData>;
            }

            console.log('Starting new dashboard data fetch');
            lastFetchTime = Date.now();

            // Create a timeout promise to prevent hanging
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Dashboard data fetch timed out after 15 seconds'));
                }, 15000); // 15 second timeout
            });

            // Create a new promise for this fetch
            activeFetchPromise = Promise.race([
                this.fetchAllDataInParallel(businessProfileId),
                timeoutPromise
            ]).then(data => {
                // Cache the result
                dashboardCache = {
                    data: data as DashboardData,
                    timestamp: Date.now(),
                    businessProfileId
                };
                return data;
            }).finally(() => {
                // Clear the active promise when done, regardless of success or failure
                activeFetchPromise = null;
            });

            return activeFetchPromise as Promise<DashboardData>;
        } catch (error) {
            // Clear the active promise on error
            activeFetchPromise = null;
            console.error('Dashboard fetch error:', error);
            
            // Return cached data if available
            if (dashboardCache) {
                console.log('Returning cached dashboard data after error');
                return dashboardCache.data;
            }
            
            throw error;
        }
    },

    /**
     * Fetch all data in parallel with proper error handling for each service
     */
    async fetchAllDataInParallel(businessProfileId: string | null): Promise<DashboardData> {
        try {
            console.log('Fetching all dashboard data in parallel...');
            
            // Log the business profile ID for debugging
            if (businessProfileId) {
                console.log(`Fetching dashboard data for business profile: ${businessProfileId}`);
            } else {
                console.log('No business profile ID available for dashboard data fetch');
            }

            // Store promises so we can handle individual failures without failing the whole request
            const promises = {
                salesData: fetchMonthlySales().catch(err => {
                    console.error('Monthly sales fetch failed:', err);
                    return { currentMonthSales: 0, monthlySalesData: [] };
                }),
                salesGrowth: fetchSalesGrowth().catch(err => {
                    console.error('Sales growth fetch failed:', err);
                    return 0;
                }),
                lowStockCount: fetchLowStockCount().catch(err => {
                    console.error('Low stock count fetch failed:', err);
                    return 0;
                }),
                inventoryValue: fetchInventoryValue().catch(err => {
                    console.error('Inventory value fetch failed:', err);
                    return 0;
                }),
                categoryStats: fetchCategoryStats().catch(err => {
                    console.error('Category stats fetch failed:', err);
                    return [];
                }),
                recentActivity: fetchRecentActivity().catch(err => {
                    console.error('Recent activity fetch failed:', err);
                    return [];
                }),
                recentSales: fetchRecentSales().catch(err => {
                    console.error('Recent sales fetch failed:', err);
                    return [];
                }),
                topSellingItems: fetchTopSellingItems().catch(err => {
                    console.error('Top selling items fetch failed:', err);
                    return [];
                }),
                inventoryAlerts: fetchInventoryAlerts().catch(err => {
                    console.error('Inventory alerts fetch failed:', err);
                    return [];
                })
            };

            // Wait for all promises to resolve (they won't reject due to our catch handlers)
            const [
                salesData,
                salesGrowth,
                lowStockCount,
                inventoryValue,
                categoryStats,
                recentActivity,
                recentSales,
                topSellingItems,
                inventoryAlerts
            ] = await Promise.all([
                promises.salesData,
                promises.salesGrowth,
                promises.lowStockCount,
                promises.inventoryValue,
                promises.categoryStats,
                promises.recentActivity,
                promises.recentSales,
                promises.topSellingItems,
                promises.inventoryAlerts
            ]);

            // Return consolidated data in the same structure as before
            return {
                salesData: {
                    currentMonthSales: salesData.currentMonthSales,
                    monthlySalesData: salesData.monthlySalesData,
                    salesGrowth: salesGrowth
                },
                stats: {
                    totalInventoryValue: inventoryValue,
                    lowStockItems: lowStockCount,
                    monthlySales: salesData.currentMonthSales,
                    salesGrowth: salesGrowth,
                    categoryStats
                },
                recentActivity,
                recentSales,
                topSellingItems,
                inventoryAlerts,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Return minimal data instead of throwing
            return {
                salesData: {
                    currentMonthSales: 0,
                    monthlySalesData: [],
                    salesGrowth: 0
                },
                stats: {
                    totalInventoryValue: 0,
                    lowStockItems: 0,
                    monthlySales: 0,
                    salesGrowth: 0,
                    categoryStats: []
                },
                recentActivity: [],
                recentSales: [],
                topSellingItems: [],
                inventoryAlerts: [],
                lastUpdated: new Date().toISOString()
            };
        }
    }
};

export default dashboardService;