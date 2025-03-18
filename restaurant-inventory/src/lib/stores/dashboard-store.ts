import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CategoryStat, DashboardStats } from '@/lib/types';
import { dashboardService } from '@/lib/services/dashboard-service';
import { ActivityItem } from '@/lib/services/dashboard/types';

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

    // Actions
    fetchDashboardData: () => Promise<void>;
    resetData: () => void;
    setShouldRefresh: (value: boolean) => void;

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
    isLoading: true,
    error: null,
    lastUpdated: null,
    shouldRefresh: true,
    fetchInProgress: false
};

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setShouldRefresh: (value: boolean) => {
                console.log('Setting shouldRefresh:', value);
                set({ shouldRefresh: value });
            },

            fetchDashboardData: async () => {
                // Track the fetch attempt to avoid multiple simultaneous fetches
                if (get().fetchInProgress) {
                    console.log('Already fetching dashboard data, skipping duplicate request...');
                    return;
                }

                // Set initial loading and fetch states
                set({ isLoading: true, error: null, fetchInProgress: true });
                console.log('Fetching dashboard data from store...');

                // Create a timeout to prevent hanging
                const MAX_FETCH_TIME = 15000; // 15 seconds
                const fetchTimeoutId = setTimeout(() => {
                    // Check if still in progress and force complete
                    if (get().fetchInProgress) {
                        console.error('Dashboard data fetch timed out after 15 seconds');
                        set({
                            isLoading: false,
                            fetchInProgress: false,
                            error: 'Request timed out. Please try again.'
                        });
                    }
                }, MAX_FETCH_TIME);

                try {
                    // Add retry logic
                    const fetchWithRetry = async (retries = 2) => {
                        try {
                            const data = await dashboardService.fetchDashboardData();

                            // Create properly structured return object
                            return {
                                stats: {
                                    totalInventoryValue: data.stats?.totalInventoryValue ?? 0,
                                    lowStockItems: data.stats?.lowStockItems ?? 0,
                                    monthlySales: data.salesData?.currentMonthSales ?? 0,
                                    salesGrowth: data.salesData?.salesGrowth ?? 0
                                },
                                salesData: data.salesData?.monthlySalesData || [],
                                categoryStats: data.stats?.categoryStats || [],
                                recentActivity: (data.recentActivity || []).map((activity: ActivityItem) => ({
                                    action: activity.title || '',
                                    item: activity.description || '',
                                    timestamp: activity.formattedDate || '',
                                    user: ''
                                })),
                                inventoryAlerts: data.inventoryAlerts || [],
                                topSellingItems: data.topSellingItems || [],

                                // Add these missing required fields to match the DashboardState interface
                                isLoading: false,
                                fetchInProgress: false,
                                error: null,
                                lastUpdated: Date.now(),
                                shouldRefresh: false
                            };
                        } catch (error) {
                            if (retries > 0) {
                                console.log(`Retrying dashboard data fetch. Attempts remaining: ${retries}`);
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                return fetchWithRetry(retries - 1);
                            }
                            throw error;
                        }
                    };

                    const dashboardData = await fetchWithRetry();

                    // Clear the timeout since fetch succeeded
                    clearTimeout(fetchTimeoutId);

                    // Only update if still loading (no cancel has happened)
                    if (get().fetchInProgress) {
                        // Update the store with fetched data
                        set((state) => ({
                            ...state,
                            stats: dashboardData.stats,
                            salesData: dashboardData.salesData,
                            categoryStats: dashboardData.categoryStats,
                            recentActivity: dashboardData.recentActivity,
                            inventoryAlerts: dashboardData.inventoryAlerts,
                            topSellingItems: dashboardData.topSellingItems,
                            isLoading: false,
                            fetchInProgress: false,
                            lastUpdated: Date.now(),
                            error: null
                        }));
                        console.log('Dashboard data updated in store successfully');
                    } else {
                        console.log('Fetch completed but update was cancelled');
                    }
                } catch (error) {
                    // Clear the timeout since fetch failed
                    clearTimeout(fetchTimeoutId);

                    console.error('Error fetching dashboard data:', error);

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
                        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
                        ...(hasExistingData ? {} : initialState),
                        lastUpdated: hasExistingData ? currentState.lastUpdated : null
                    });

                    console.log('Store state after error:', {
                        hasExistingData,
                        statsAvailable: currentState.stats.totalInventoryValue > 0,
                        salesDataAvailable: currentState.salesData.length > 0,
                        categoryDataAvailable: currentState.categoryStats.length > 0
                    });
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
            partialize: (state) => ({
                // Only store these values in localStorage
                stats: state.stats,
                salesData: state.salesData,
                categoryStats: state.categoryStats,
                topSellingItems: state.topSellingItems,
                lastUpdated: state.lastUpdated
            }),
        }
    )
); 