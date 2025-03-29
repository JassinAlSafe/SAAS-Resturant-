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

// Track active abort controllers to allow cancellation
const activeAbortControllers: Map<string, AbortController> = new Map();

// Track last fetch time for throttling
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 10000; // 10 seconds minimum between fetch attempts

// Define request options interface
export interface DashboardRequestOptions {
    signal?: AbortSignal;
    forceFresh?: boolean;
    timeout?: number;
    retry?: boolean;
    maxRetries?: number;
}

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

// Define section-specific data interfaces
export interface SalesData {
    currentMonthSales: number;
    monthlySalesData: { month: string; sales: number }[];
    salesGrowth: number;
}

export interface InventoryData {
    totalValue: number;
    lowStockCount: number;
    categoryStats: CategoryStat[];
    alerts: InventoryAlert[];
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

// Default request timeout
const DEFAULT_TIMEOUT = 20000; // 20 seconds

/**
 * Main service for fetching all dashboard data
 */
export const dashboardService = {
    /**
     * Fetch all dashboard data with deduplication and improved error handling
     */
    async fetchDashboardData(options: DashboardRequestOptions = {}): Promise<DashboardData> {
        const requestId = Math.random().toString(36).substring(2, 9);
        const operationName = 'fetchDashboardData';
        const startTime = performance.now();

        try {
            // Set up AbortController if not provided
            let signal = options.signal;
            let localAbortController: AbortController | null = null;

            if (!signal) {
                localAbortController = new AbortController();
                signal = localAbortController.signal;
                activeAbortControllers.set(requestId, localAbortController);
            }

            // First, get the business profile ID to check if cache is valid
            const businessProfileId = await getBusinessProfileId();

            // If no business profile ID, return empty data immediately
            if (!businessProfileId) {
                console.log('No business profile ID found, returning empty dashboard data');
                return this.getEmptyDashboardData();
            }

            // Check if we have valid cached data for this business profile
            if (
                !options.forceFresh &&
                dashboardCache &&
                dashboardCache.businessProfileId === businessProfileId &&
                Date.now() - dashboardCache.timestamp < CACHE_TTL
            ) {
                console.log('Using cached dashboard data');
                return dashboardCache.data;
            }

            // Check if we're fetching too frequently
            const now = Date.now();
            if (now - lastFetchTime < MIN_FETCH_INTERVAL && !options.forceFresh) {
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
            if (activeFetchPromise && !options.forceFresh) {
                console.log('Another fetch is already in progress, returning that promise');
                return activeFetchPromise as Promise<DashboardData>;
            }

            console.log(`Starting new dashboard data fetch (requestId: ${requestId})`);
            lastFetchTime = Date.now();

            // Create a timeout promise to prevent hanging
            const timeoutMs = options.timeout || DEFAULT_TIMEOUT;
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Dashboard data fetch timed out after ${timeoutMs}ms`));
                }, timeoutMs);
            });

            // Determine if we should retry
            const shouldRetry = options.retry !== false;
            const maxRetries = options.maxRetries !== undefined ? options.maxRetries : MAX_RETRIES;

            // Create a new promise for this fetch with retry logic
            activeFetchPromise = Promise.race([
                shouldRetry
                    ? this.fetchWithRetry(businessProfileId, { ...options, signal, maxRetries })
                    : this.fetchAllDataInParallel(businessProfileId, { signal }),
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
                // Clean up
                if (localAbortController) {
                    activeAbortControllers.delete(requestId);
                }

                // Clear the active promise when done, regardless of success or failure
                if (activeFetchPromise && !options.forceFresh) {
                    activeFetchPromise = null;
                }

                const duration = performance.now() - startTime;
                console.log(`${operationName} completed in ${duration.toFixed(2)}ms`);
            });

            return activeFetchPromise as Promise<DashboardData>;
        } catch (error: unknown) {
            // Clean up abort controller
            activeAbortControllers.delete(requestId);

            // Clear the active promise on error if it's not a forced refresh
            if (!options.forceFresh) {
                activeFetchPromise = null;
            }

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
     * Cancel all in-flight requests
     */
    cancelAllRequests(): void {
        console.log(`Cancelling ${activeAbortControllers.size} in-flight requests`);

        activeAbortControllers.forEach((controller, id) => {
            console.log(`Aborting request ${id}`);
            controller.abort();
        });

        activeAbortControllers.clear();
        activeFetchPromise = null;
    },

    /**
     * Fetch with retry logic for resilience
     */
    async fetchWithRetry(
        businessProfileId: string | null,
        options: { signal?: AbortSignal; maxRetries?: number } = {},
        retryCount = 0
    ): Promise<DashboardData> {
        try {
            // If no business profile ID, return empty data immediately
            if (!businessProfileId) {
                console.log('No business profile ID for retry, returning empty dashboard data');
                return this.getEmptyDashboardData();
            }

            // Check if the request has been aborted
            if (options.signal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            // Attempt to fetch all data in parallel
            return await this.fetchAllDataInParallel(businessProfileId, { signal: options.signal });
        } catch (error: unknown) {
            // Don't retry if it's an abort error
            if (error instanceof Error && error.name === 'AbortError') {
                throw error;
            }

            console.error(`Dashboard data fetch attempt ${retryCount + 1} failed:`, error);

            const maxRetries = options.maxRetries !== undefined ? options.maxRetries : MAX_RETRIES;

            // Implement exponential backoff with jitter for retries
            if (retryCount < maxRetries) {
                const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount) * (0.5 + Math.random());
                console.log(`Retrying dashboard data fetch in ${Math.round(delay)}ms...`);

                // Check for abort before delay
                if (options.signal?.aborted) {
                    throw new DOMException('Aborted', 'AbortError');
                }

                // Create an abortable delay promise
                await new Promise((resolve, reject) => {
                    const timer = setTimeout(resolve, delay);
                    options.signal?.addEventListener('abort', () => {
                        clearTimeout(timer);
                        reject(new DOMException('Aborted', 'AbortError'));
                    }, { once: true });
                });

                // Check for abort after delay
                if (options.signal?.aborted) {
                    throw new DOMException('Aborted', 'AbortError');
                }

                return this.fetchWithRetry(businessProfileId, options, retryCount + 1);
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
    async fetchAllDataInParallel(
        businessProfileId: string | null,
        options: { signal?: AbortSignal } = {}
    ): Promise<DashboardData> {
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
                fetchInventoryValue({ signal: options.signal }).catch(err => {
                    console.error('Error fetching inventory value:', err);
                    return 0;
                }),
                fetchLowStockCount({ signal: options.signal }).catch(err => {
                    console.error('Error fetching low stock count:', err);
                    return 0;
                }),
                fetchMonthlySales({ signal: options.signal }).catch(err => {
                    console.error('Error fetching monthly sales:', err);
                    return { currentMonthSales: 0, monthlySalesData: [] };
                }),
                fetchSalesGrowth({ signal: options.signal }).catch(err => {
                    console.error('Error fetching sales growth:', err);
                    return 0;
                }),
                fetchCategoryStats({ signal: options.signal }).catch(err => {
                    console.error('Error fetching category stats:', err);
                    return [];
                }),
                fetchRecentActivity({ signal: options.signal }).catch(err => {
                    console.error('Error fetching recent activity:', err);
                    return [];
                }),
                fetchRecentSales({ signal: options.signal }).catch(err => {
                    console.error('Error fetching recent sales:', err);
                    return [];
                }),
                fetchTopSellingItems({ signal: options.signal }).catch(err => {
                    console.error('Error fetching top selling items:', err);
                    return [];
                }),
                fetchInventoryAlerts({ signal: options.signal }).catch(err => {
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
     * Fetch only sales-related data
     */
    async fetchSalesData(options: DashboardRequestOptions = {}): Promise<SalesData> {
        const startTime = performance.now();

        try {
            // Set up AbortController if not provided
            let signal = options.signal;
            let localAbortController: AbortController | null = null;

            if (!signal) {
                localAbortController = new AbortController();
                signal = localAbortController.signal;
            }

            const businessProfileId = await getBusinessProfileId();

            if (!businessProfileId) {
                return {
                    currentMonthSales: 0,
                    monthlySalesData: [],
                    salesGrowth: 0
                };
            }

            const [monthlySalesResult, salesGrowthResult] = await Promise.allSettled([
                fetchMonthlySales({ signal }),
                fetchSalesGrowth({ signal })
            ]);

            const monthlySales = monthlySalesResult.status === 'fulfilled'
                ? monthlySalesResult.value
                : { currentMonthSales: 0, monthlySalesData: [] };

            const salesGrowth = salesGrowthResult.status === 'fulfilled'
                ? salesGrowthResult.value
                : 0;

            return {
                currentMonthSales: monthlySales.currentMonthSales,
                monthlySalesData: monthlySales.monthlySalesData,
                salesGrowth
            };
        } catch (error) {
            console.error('Error fetching sales data:', error);
            return {
                currentMonthSales: 0,
                monthlySalesData: [],
                salesGrowth: 0
            };
        } finally {
            const duration = performance.now() - startTime;
            console.log(`fetchSalesData completed in ${duration.toFixed(2)}ms`);
        }
    },

    /**
     * Fetch only inventory-related data
     */
    async fetchInventoryData(options: DashboardRequestOptions = {}): Promise<InventoryData> {
        const startTime = performance.now();

        try {
            // Set up AbortController if not provided
            let signal = options.signal;
            let localAbortController: AbortController | null = null;

            if (!signal) {
                localAbortController = new AbortController();
                signal = localAbortController.signal;
            }

            const businessProfileId = await getBusinessProfileId();

            if (!businessProfileId) {
                return {
                    totalValue: 0,
                    lowStockCount: 0,
                    categoryStats: [],
                    alerts: []
                };
            }

            const [valueResult, countResult, categoryResult, alertsResult] = await Promise.allSettled([
                fetchInventoryValue({ signal }),
                fetchLowStockCount({ signal }),
                fetchCategoryStats({ signal }),
                fetchInventoryAlerts({ signal })
            ]);

            return {
                totalValue: valueResult.status === 'fulfilled' ? valueResult.value : 0,
                lowStockCount: countResult.status === 'fulfilled' ? countResult.value : 0,
                categoryStats: categoryResult.status === 'fulfilled' ? categoryResult.value : [],
                alerts: alertsResult.status === 'fulfilled' ? alertsResult.value : []
            };
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            return {
                totalValue: 0,
                lowStockCount: 0,
                categoryStats: [],
                alerts: []
            };
        } finally {
            const duration = performance.now() - startTime;
            console.log(`fetchInventoryData completed in ${duration.toFixed(2)}ms`);
        }
    },

    /**
     * Fetch only activity data
     */
    async fetchRecentActivity(options: DashboardRequestOptions = {}): Promise<ActivityItem[]> {
        const startTime = performance.now();

        try {
            // Set up AbortController if not provided
            let signal = options.signal;
            let localAbortController: AbortController | null = null;

            if (!signal) {
                localAbortController = new AbortController();
                signal = localAbortController.signal;
            }

            const businessProfileId = await getBusinessProfileId();

            if (!businessProfileId) {
                return [];
            }

            return await fetchRecentActivity({ signal });
        } catch (error) {
            console.error('Error fetching activity data:', error);
            return [];
        } finally {
            const duration = performance.now() - startTime;
            console.log(`fetchRecentActivity completed in ${duration.toFixed(2)}ms`);
        }
    },

    /**
     * Clear dashboard cache
     */
    clearCache(): void {
        dashboardCache = null;
        console.log('Dashboard cache cleared');
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