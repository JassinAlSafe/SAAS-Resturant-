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
const MIN_FETCH_INTERVAL = 10000; // 10 seconds minimum between fetch attempts

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

// Maximum number of retries for failed requests
const MAX_RETRIES = 2;

// Retry delay in milliseconds (exponential backoff)
const RETRY_DELAY_BASE = 1000;

/**
 * Main service for fetching all dashboard data
 */
export const dashboardService = {
    /**
     * Fetch all dashboard data with deduplication and improved error handling
     */
    async fetchDashboardData(): Promise<DashboardData> {
        try {
            // First, get the business profile ID to check if cache is valid
            const businessProfileId = await getBusinessProfileId();
            
            // If no business profile ID, return empty data immediately
            if (!businessProfileId) {
                console.log('No business profile ID found, returning empty dashboard data');
                return this.getEmptyDashboardData();
            }
            
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
                    reject(new Error('Dashboard data fetch timed out after 20 seconds'));
                }, 20000); // 20 second timeout (increased from 15)
            });

            // Create a new promise for this fetch with retry logic
            activeFetchPromise = Promise.race([
                this.fetchWithRetry(businessProfileId),
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
            
            // Return cached data if available, even if it's stale
            if (dashboardCache) {
                console.log('Returning cached dashboard data after error');
                return dashboardCache.data;
            }
            
            // If no cache is available, return empty data structure instead of throwing
            return this.getEmptyDashboardData();
        }
    },

    /**
     * Fetch with retry logic for resilience
     */
    async fetchWithRetry(businessProfileId: string | null, retryCount = 0): Promise<DashboardData> {
        try {
            // If no business profile ID, return empty data immediately
            if (!businessProfileId) {
                console.log('No business profile ID for retry, returning empty dashboard data');
                return this.getEmptyDashboardData();
            }
            
            // Attempt to fetch all data in parallel
            return await this.fetchAllDataInParallel(businessProfileId);
        } catch (error) {
            console.error(`Dashboard data fetch attempt ${retryCount + 1} failed:`, error);
            
            // Implement exponential backoff with jitter for retries
            if (retryCount < MAX_RETRIES) {
                const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount) * (0.5 + Math.random());
                console.log(`Retrying dashboard data fetch in ${Math.round(delay)}ms...`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchWithRetry(businessProfileId, retryCount + 1);
            }
            
            // If all retries fail, return cached data if available
            if (dashboardCache) {
                console.log('All retries failed, returning cached dashboard data');
                return dashboardCache.data;
            }
            
            // If no cache is available, return empty data structure
            return this.getEmptyDashboardData();
        }
    },

    /**
     * Fetch all data in parallel with proper error handling for each service
     */
    async fetchAllDataInParallel(businessProfileId: string | null): Promise<DashboardData> {
        console.log(`Fetching dashboard data for business profile: ${businessProfileId || 'none'}`);
        
        // If no business profile ID, return empty data immediately
        if (!businessProfileId) {
            console.log('No business profile ID for parallel fetch, returning empty dashboard data');
            return this.getEmptyDashboardData();
        }
        
        try {
            // Run all fetches in parallel with individual error handling
            const [
                inventoryValueResult,
                lowStockCountResult,
                monthlySalesResult,
                salesGrowthResult,
                categoryStatsResult,
                recentActivityResult,
                recentSalesResult,
                topSellingItemsResult,
                inventoryAlertsResult
            ] = await Promise.allSettled([
                fetchInventoryValue().catch(err => {
                    console.error('Error fetching inventory value:', err);
                    return 0;
                }),
                fetchLowStockCount().catch(err => {
                    console.error('Error fetching low stock count:', err);
                    return 0;
                }),
                fetchMonthlySales().catch(err => {
                    console.error('Error fetching monthly sales:', err);
                    return { currentMonthSales: 0, monthlySalesData: [] };
                }),
                fetchSalesGrowth().catch(err => {
                    console.error('Error fetching sales growth:', err);
                    return 0;
                }),
                fetchCategoryStats().catch(err => {
                    console.error('Error fetching category stats:', err);
                    return [];
                }),
                fetchRecentActivity().catch(err => {
                    console.error('Error fetching recent activity:', err);
                    return [];
                }),
                fetchRecentSales().catch(err => {
                    console.error('Error fetching recent sales:', err);
                    return [];
                }),
                fetchTopSellingItems().catch(err => {
                    console.error('Error fetching top selling items:', err);
                    return [];
                }),
                fetchInventoryAlerts().catch(err => {
                    console.error('Error fetching inventory alerts:', err);
                    return [];
                })
            ]);

            // Extract values from Promise.allSettled results
            const getValue = <T>(result: PromiseSettledResult<T>, defaultValue: T): T => {
                return result.status === 'fulfilled' ? result.value : defaultValue;
            };

            const inventoryValue = getValue(inventoryValueResult, 0);
            const lowStockCount = getValue(lowStockCountResult, 0);
            const monthlySales = getValue(monthlySalesResult, { currentMonthSales: 0, monthlySalesData: [] });
            const salesGrowth = getValue(salesGrowthResult, 0);
            const categoryStats = getValue(categoryStatsResult, []);
            const recentActivity = getValue(recentActivityResult, []);
            const recentSales = getValue(recentSalesResult, []);
            const topSellingItems = getValue(topSellingItemsResult, []);
            const inventoryAlerts = getValue(inventoryAlertsResult, []);

            // Construct the dashboard data
            const dashboardData: DashboardData = {
                salesData: {
                    currentMonthSales: monthlySales.currentMonthSales,
                    monthlySalesData: monthlySales.monthlySalesData,
                    salesGrowth: salesGrowth
                },
                stats: {
                    totalInventoryValue: inventoryValue,
                    lowStockItems: lowStockCount,
                    monthlySales: monthlySales.currentMonthSales,
                    salesGrowth: salesGrowth,
                    categoryStats: categoryStats
                },
                recentActivity,
                recentSales,
                topSellingItems,
                inventoryAlerts,
                lastUpdated: new Date().toISOString()
            };

            return dashboardData;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },

    /**
     * Get empty dashboard data structure for fallback
     */
    getEmptyDashboardData(): DashboardData {
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
};

export default dashboardService;