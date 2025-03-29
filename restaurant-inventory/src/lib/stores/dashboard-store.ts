import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CategoryStat, DashboardStats } from '@/lib/types';
import { dashboardService } from '@/lib/services/dashboard-service';
import { ActivityItem } from '@/lib/services/dashboard/types';

// Improved type definitions
export interface RecentActivity {
    action: string;
    item: string;
    timestamp: string;
    user: string;
}

export interface InventoryAlert {
    id: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
    expiryDate: string | null;
    type: 'low_stock' | 'expiring';
}

export interface TopSellingItem {
    name: string;
    quantity: number;
}

export interface SalesDataPoint {
    month: string;
    sales: number;
}

interface LoadingState {
    sales: boolean;
    inventory: boolean;
    activity: boolean;
    stats: boolean;
    overall: boolean;
}

interface ErrorState {
    message: string | null;
    code?: string;
    timestamp?: number;
    retryCount: number;
}

interface DashboardState {
    // Data
    stats: DashboardStats;
    salesData: SalesDataPoint[];
    categoryStats: CategoryStat[];
    recentActivity: RecentActivity[];
    inventoryAlerts: InventoryAlert[];
    topSellingItems: TopSellingItem[];

    // State management
    isLoading: boolean;
    loadingState: LoadingState;
    error: ErrorState | null;
    lastUpdated: number | null;
    shouldRefresh: boolean;
    fetchInProgress: boolean;
    lastRefreshRequest: number;

    // Actions
    fetchDashboardData: () => Promise<void>;
    fetchPartialData: (section: keyof LoadingState) => Promise<void>;
    resetData: () => void;
    setShouldRefresh: (value: boolean) => void;
    cancelPendingRequests: () => void;

    // Selective update methods
    updateSalesData: (salesData: SalesDataPoint[]) => void;
    updateStats: (stats: Partial<DashboardStats>) => void;
    updateInventoryAlerts: (alerts: InventoryAlert[]) => void;
    updateCategoryStats: (stats: CategoryStat[]) => void;
    updateActivity: (activity: RecentActivity[]) => void;
    updateTopSellingItems: (items: TopSellingItem[]) => void;
}

const initialState = {
    stats: {
        totalInventoryValue: 0,
        lowStockItems: 0,
        monthlySales: 0,
        salesGrowth: 0
    },
    salesData: [],
    categoryStats: [],
    recentActivity: [],
    inventoryAlerts: [],
    topSellingItems: [],
    isLoading: true,
    loadingState: {
        sales: true,
        inventory: true,
        activity: true,
        stats: true,
        overall: true
    },
    error: null,
    lastUpdated: null,
    shouldRefresh: false,
    fetchInProgress: false,
    lastRefreshRequest: 0
};

// Constraint settings
const MIN_REFRESH_INTERVAL = 10000; // 10 seconds minimum between refresh requests
const MAX_RETRY_ATTEMPTS = 3;

// Track active request controller for cancellation
let abortController: AbortController | null = null;

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setShouldRefresh: (value: boolean) => {
                // Only apply throttling when setting to true
                if (value === true) {
                    const now = Date.now();
                    const lastRefreshRequest = get().lastRefreshRequest;

                    // Check if we're requesting refresh too frequently
                    if (now - lastRefreshRequest < MIN_REFRESH_INTERVAL) {
                        console.log(`Refresh requested too soon (${now - lastRefreshRequest}ms since last request), throttling`);
                        return; // Skip this refresh request
                    }

                    // Update last refresh timestamp
                    set({ lastRefreshRequest: now });
                }

                set({ shouldRefresh: value });
            },

            fetchDashboardData: async () => {
                // Track the fetch attempt to avoid multiple simultaneous fetches
                if (get().fetchInProgress) {
                    console.log('Already fetching dashboard data, skipping duplicate request...');
                    return;
                }

                // Create new abort controller for this request
                if (abortController) {
                    abortController.abort();
                }
                abortController = new AbortController();

                // Set initial loading and fetch states
                const isFirstLoad = get().lastUpdated === null;
                set({
                    isLoading: isFirstLoad,
                    fetchInProgress: true,
                    loadingState: {
                        ...get().loadingState,
                        overall: true
                    }
                });

                try {
                    // Use the dashboard service to fetch data
                    const data = await dashboardService.fetchDashboardData({
                        signal: abortController.signal
                    });

                    // Create properly structured return object with data validation
                    const dashboardData = {
                        stats: {
                            totalInventoryValue: Number(data.stats?.totalInventoryValue) || 0,
                            lowStockItems: Number(data.stats?.lowStockItems) || 0,
                            monthlySales: Number(data.salesData?.currentMonthSales) || 0,
                            salesGrowth: Number(data.salesData?.salesGrowth) || 0
                        },
                        salesData: Array.isArray(data.salesData?.monthlySalesData) ? data.salesData.monthlySalesData : [],
                        categoryStats: Array.isArray(data.stats?.categoryStats) ? data.stats.categoryStats : [],
                        recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity.map((activity: ActivityItem) => ({
                            action: activity.title || '',
                            item: activity.description || '',
                            timestamp: activity.formattedDate || '',
                            user: ''
                        })) : [],
                        inventoryAlerts: Array.isArray(data.inventoryAlerts) ? data.inventoryAlerts : [],
                        topSellingItems: Array.isArray(data.topSellingItems) ? data.topSellingItems : [],
                    };

                    // Update the store with fetched data
                    set({
                        stats: dashboardData.stats,
                        salesData: dashboardData.salesData,
                        categoryStats: dashboardData.categoryStats,
                        recentActivity: dashboardData.recentActivity,
                        inventoryAlerts: dashboardData.inventoryAlerts,
                        topSellingItems: dashboardData.topSellingItems,
                        isLoading: false,
                        loadingState: {
                            sales: false,
                            inventory: false,
                            activity: false,
                            stats: false,
                            overall: false
                        },
                        fetchInProgress: false,
                        error: null,
                        lastUpdated: Date.now(),
                        shouldRefresh: false // Reset the refresh flag
                    });

                    console.log('Dashboard data updated in store successfully');
                } catch (error: unknown) {
                    // Skip error handling for aborted requests
                    if (error instanceof Error && error.name === 'AbortError') {
                        console.log('Dashboard data fetch aborted');
                        set({ fetchInProgress: false });
                        return;
                    }

                    console.error('Error fetching dashboard data:', error);

                    const currentError = get().error;
                    const retryCount = currentError ? currentError.retryCount : 0;
                    const newRetryCount = retryCount + 1;

                    // On error, keep existing data but update error state
                    set({
                        isLoading: false,
                        loadingState: {
                            ...get().loadingState,
                            overall: false
                        },
                        fetchInProgress: false,
                        error: {
                            message: error instanceof Error ? error.message : 'Failed to load dashboard data. Please try again later.',
                            code: (error as any)?.code,
                            timestamp: Date.now(),
                            retryCount: newRetryCount
                        },
                        shouldRefresh: false // Reset the refresh flag
                    });

                    // Auto-retry if below max attempts
                    if (newRetryCount < MAX_RETRY_ATTEMPTS) {
                        console.log(`Auto-retry attempt ${newRetryCount}/${MAX_RETRY_ATTEMPTS} in ${2000 * newRetryCount}ms`);
                        setTimeout(() => {
                            if (!get().fetchInProgress) {
                                get().setShouldRefresh(true);
                            }
                        }, 2000 * newRetryCount);
                    }
                } finally {
                    abortController = null;
                }
            },

            fetchPartialData: async (section: keyof LoadingState) => {
                // Set loading state for specific section
                set(state => ({
                    loadingState: {
                        ...state.loadingState,
                        [section]: true
                    }
                }));

                try {
                    // Implement section-specific fetching logic
                    switch (section) {
                        case 'sales':
                            const salesData = await dashboardService.fetchSalesData();
                            set({
                                salesData: salesData.monthlySalesData || [],
                                stats: {
                                    ...get().stats,
                                    monthlySales: salesData.currentMonthSales || 0,
                                    salesGrowth: salesData.salesGrowth || 0
                                }
                            });
                            break;
                        case 'inventory':
                            const inventoryData = await dashboardService.fetchInventoryData();
                            set({
                                inventoryAlerts: inventoryData.alerts || [],
                                categoryStats: inventoryData.categoryStats || [],
                                stats: {
                                    ...get().stats,
                                    totalInventoryValue: inventoryData.totalValue || 0,
                                    lowStockItems: inventoryData.lowStockCount || 0
                                }
                            });
                            break;
                        case 'activity':
                            const activity = await dashboardService.fetchRecentActivity();
                            set({
                                recentActivity: activity.map((item: ActivityItem) => ({
                                    action: item.title || '',
                                    item: item.description || '',
                                    timestamp: item.formattedDate || '',
                                    user: ''
                                }))
                            });
                            break;
                        default:
                            // If overall or stats, fetch everything
                            await get().fetchDashboardData();
                            return;
                    }

                    // Update last updated timestamp and reset error
                    set(state => ({
                        lastUpdated: Date.now(),
                        loadingState: {
                            ...state.loadingState,
                            [section]: false
                        },
                        error: null
                    }));
                } catch (error: unknown) {
                    console.error(`Error fetching ${section} data:`, error);
                    set(state => ({
                        loadingState: {
                            ...state.loadingState,
                            [section]: false
                        },
                        error: {
                            message: `Failed to load ${section} data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            timestamp: Date.now(),
                            retryCount: state.error?.retryCount || 0
                        }
                    }));
                }
            },

            resetData: () => {
                // Cancel any pending requests
                get().cancelPendingRequests();

                // Reset to initial state but trigger a refresh
                set({
                    ...initialState,
                    shouldRefresh: true, // Trigger a refresh after reset
                    lastRefreshRequest: Date.now() // Update the timestamp
                });
            },

            cancelPendingRequests: () => {
                if (abortController) {
                    abortController.abort();
                    abortController = null;
                    set({ fetchInProgress: false });
                }
            },

            updateSalesData: (salesData: SalesDataPoint[]) => {
                set({ salesData });
            },

            updateStats: (partialStats: Partial<DashboardStats>) => {
                set((state) => ({
                    stats: {
                        ...state.stats,
                        ...partialStats
                    }
                }));
            },

            updateInventoryAlerts: (alerts: InventoryAlert[]) => {
                set({ inventoryAlerts: alerts });
            },

            updateCategoryStats: (stats: CategoryStat[]) => {
                set({ categoryStats: stats });
            },

            updateActivity: (activity: RecentActivity[]) => {
                set({ recentActivity: activity });
            },

            updateTopSellingItems: (items: TopSellingItem[]) => {
                set({ topSellingItems: items });
            }
        }),
        {
            name: 'dashboard-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist these fields to localStorage
                stats: state.stats,
                salesData: state.salesData,
                categoryStats: state.categoryStats,
                lastUpdated: state.lastUpdated
            })
        }
    )
);