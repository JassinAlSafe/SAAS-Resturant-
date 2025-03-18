import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CategoryStat, DashboardStats } from '@/lib/types';
import { dashboardService } from '@/lib/services/dashboard-service';

interface RecentActivity {
    action: string;
    item: string;
    timestamp: string;
    user: string;
}

interface InventoryAlert {
    id: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
    expiryDate: string | null;
    type: 'low_stock' | 'expiring';
}

// New type definitions for the dashboard service
export interface DashboardSalesData {
    currentMonthSales: number;
    monthlySalesData: { month: string; sales: number }[];
    salesGrowth: number;
}

export interface RecentSale {
    id: string;
    date: string;
    amount: number;
    customer: string;
}

export interface DashboardData {
    salesData: DashboardSalesData;
    stats: DashboardStats & { categoryStats?: CategoryStat[] }; // Make categoryStats optional
    recentActivity: RecentActivity[];
    recentSales: RecentSale[];
    topSellingItems: { name: string; quantity: number }[];
    inventoryAlerts: InventoryAlert[];
    lastUpdated: string;
}

interface DashboardState {
    // Data
    stats: DashboardStats;
    salesData: { month: string; sales: number }[];
    categoryStats: CategoryStat[];
    recentActivity: RecentActivity[];
    inventoryAlerts: InventoryAlert[];
    topSellingItems: { name: string; quantity: number }[];

    // Loading and error states
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
    shouldRefresh: boolean;
    fetchInProgress: boolean;
    refreshLock: boolean;
    loadingSince: number | null;

    // Actions
    fetchDashboardData: () => Promise<void>;
    resetData: () => void;
    setShouldRefresh: (value: boolean) => void;
    setRefreshLock: (value: boolean) => void;
    resetLoadingState: () => void;

    // Selective update methods
    updateSalesData: (salesData: { month: string; sales: number }[]) => void;
    updateStats: (stats: Partial<DashboardStats>) => void;
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
    isLoading: false, // Start with false to avoid initial loading state issues
    error: null,
    lastUpdated: null,
    shouldRefresh: true,
    fetchInProgress: false,
    refreshLock: false,
    loadingSince: null
};

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setShouldRefresh: (value: boolean) => {
                // Only update if the value is different from current state
                // and we're not in a refresh lock (unless explicitly setting to false)
                const currentState = get();
                if (currentState.shouldRefresh !== value &&
                    (!currentState.refreshLock || value === false)) {
                    set({ shouldRefresh: value });
                }
            },

            setRefreshLock: (value: boolean) => {
                set({ refreshLock: value });
            },

            resetLoadingState: () => {
                set({
                    isLoading: false,
                    fetchInProgress: false,
                    loadingSince: null
                });
            },

            fetchDashboardData: async () => {
                // Track the fetch attempt to avoid multiple simultaneous fetches
                if (get().fetchInProgress) {
                    return;
                }

                // Apply a refresh lock to prevent cascading refreshes
                get().setRefreshLock(true);

                // Set up loading state protection - auto-clear after 15 seconds
                const loadingTimestamp = Date.now();

                // Set initial loading and fetch states
                set({
                    isLoading: true,
                    error: null,
                    fetchInProgress: true,
                    loadingSince: loadingTimestamp
                });

                // Emergency loading state reset in case something goes wrong
                const loadingResetTimeout = setTimeout(() => {
                    const currentState = get();
                    if (currentState.isLoading &&
                        currentState.loadingSince === loadingTimestamp) {
                        get().resetLoadingState();

                        // Release the refresh lock
                        setTimeout(() => get().setRefreshLock(false), 1000);
                    }
                }, 15000);

                try {
                    // Add retry logic
                    const fetchWithRetry = async (retries = 2) => {
                        try {
                            const data = await dashboardService.fetchDashboardData();

                            // Create properly structured return object with consistent types
                            return {
                                stats: {
                                    totalInventoryValue: data.stats?.totalInventoryValue ?? 0,
                                    lowStockItems: data.stats?.lowStockItems ?? 0,
                                    monthlySales: data.salesData?.currentMonthSales ?? 0,
                                    salesGrowth: data.salesData?.salesGrowth ?? 0
                                },
                                salesData: data.salesData?.monthlySalesData || [],
                                categoryStats: data.categoryStats || [],
                                recentActivity: data.recentActivity || [],
                                inventoryAlerts: data.inventoryAlerts || [],
                                topSellingItems: data.topSellingItems || [],
                            };
                        } catch (error) {
                            // Check if it's an auth error
                            if (
                                error instanceof Error &&
                                (error.message.includes('Auth session missing') ||
                                    error.message.includes('JWT expired') ||
                                    error.message.includes('not authenticated') ||
                                    error.message.includes('Authentication required'))
                            ) {
                                throw new Error('Authentication required');
                            }

                            if (retries > 0) {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                return fetchWithRetry(retries - 1);
                            }
                            throw error;
                        }
                    };

                    const dashboardData = await fetchWithRetry();

                    // Clear the timeout since fetch succeeded
                    clearTimeout(loadingResetTimeout);

                    // Only update if still loading (no cancel has happened)
                    if (get().fetchInProgress) {
                        // First clear loading state
                        get().resetLoadingState();

                        // Then update the store with fetched data
                        set((state) => ({
                            ...state,
                            stats: dashboardData.stats,
                            salesData: dashboardData.salesData,
                            categoryStats: dashboardData.categoryStats,
                            recentActivity: dashboardData.recentActivity,
                            inventoryAlerts: dashboardData.inventoryAlerts,
                            topSellingItems: dashboardData.topSellingItems,
                            lastUpdated: Date.now(),
                            shouldRefresh: false
                        }));

                        // Release the refresh lock after a short delay
                        setTimeout(() => get().setRefreshLock(false), 1000);
                    } else {
                        // Still release the lock even if cancelled
                        setTimeout(() => get().setRefreshLock(false), 1000);
                    }
                } catch (error) {
                    // Clear the timeout since fetch failed
                    clearTimeout(loadingResetTimeout);

                    // Special handling for auth errors
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
                    const isAuthError =
                        error instanceof Error &&
                        (errorMessage.includes('Authentication required') ||
                            errorMessage.includes('Auth session missing') ||
                            errorMessage.includes('JWT expired') ||
                            errorMessage.includes('not authenticated'));

                    // Get current state to check for existing data
                    const currentState = get();
                    const hasExistingData =
                        currentState.stats.totalInventoryValue > 0 ||
                        currentState.salesData.length > 0 ||
                        currentState.categoryStats.length > 0;

                    // Always clear loading and fetch in progress states
                    set({
                        isLoading: false,
                        fetchInProgress: false,
                        loadingSince: null,
                        error: isAuthError ? 'Authentication required' : errorMessage,
                        ...(hasExistingData ? {} : initialState),
                        lastUpdated: hasExistingData ? currentState.lastUpdated : null
                    });

                    // Release the refresh lock even on error, but with a delay
                    setTimeout(() => get().setRefreshLock(false), 1000);
                }
            },

            resetData: () => {
                // Reset to initial state but preserve loading and error states
                const { isLoading, error } = get();
                set({ ...initialState, isLoading, error });
            },

            updateSalesData: (salesData: { month: string; sales: number }[]) => {
                set({
                    salesData,
                    lastUpdated: Date.now()
                });
            },

            updateStats: (partialStats: Partial<DashboardStats>) => {
                set(state => ({
                    stats: {
                        ...state.stats,
                        ...partialStats
                    },
                    lastUpdated: Date.now()
                }));
            }
        }),
        {
            name: 'dashboard-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
); 