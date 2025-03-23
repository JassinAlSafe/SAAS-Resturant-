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
    shouldRefresh: false, // Changed to false by default to prevent immediate fetching
    fetchInProgress: false
};

// Track last time shouldRefresh was set to true
let lastRefreshRequest = 0;
const MIN_REFRESH_INTERVAL = 10000; // 10 seconds minimum between refresh requests

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setShouldRefresh: (value: boolean) => {
                // Only apply throttling when setting to true
                if (value === true) {
                    const now = Date.now();
                    // Check if we\'re requesting refresh too frequently
                    if (now - lastRefreshRequest < MIN_REFRESH_INTERVAL) {
                        console.log(`Refresh requested too soon (${now - lastRefreshRequest}ms since last request), throttling`);
                        return; // Skip this refresh request
                    }
                    lastRefreshRequest = now;
                }

                set({ shouldRefresh: value });
            },

            fetchDashboardData: async () => {
                // Track the fetch attempt to avoid multiple simultaneous fetches
                if (get().fetchInProgress) {
                    console.log('Already fetching dashboard data, skipping duplicate request...');
                    return;
                }

                // Set initial loading and fetch states
                set({ isLoading: get().lastUpdated === null, fetchInProgress: true });

                try {
                    // Use the dashboard service to fetch data
                    const data = await dashboardService.fetchDashboardData();

                    // Create properly structured return object
                    const dashboardData = {
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
                    };

                    // Update the store with fetched data (no mock data for new accounts)
                    set({
                        stats: {
                            totalInventoryValue: dashboardData.stats.totalInventoryValue,
                            lowStockItems: dashboardData.stats.lowStockItems,
                            monthlySales: dashboardData.stats.monthlySales,
                            salesGrowth: dashboardData.stats.salesGrowth
                        },
                        salesData: dashboardData.salesData,
                        categoryStats: dashboardData.categoryStats,
                        recentActivity: dashboardData.recentActivity,
                        inventoryAlerts: dashboardData.inventoryAlerts,
                        topSellingItems: dashboardData.topSellingItems,
                        isLoading: false,
                        fetchInProgress: false,
                        error: null,
                        lastUpdated: Date.now(),
                        shouldRefresh: false // Reset the refresh flag
                    });

                    console.log('Dashboard data updated in store successfully');
                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                    
                    // On error, show empty data instead of mock data
                    set({
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
                        isLoading: false,
                        fetchInProgress: false,
                        error: 'Failed to load dashboard data. Please try again later.',
                        lastUpdated: Date.now(),
                        shouldRefresh: false // Reset the refresh flag
                    });
                    
                    console.log('Using empty data due to fetch error');
                }
            },

            resetData: () => {
                set({
                    ...initialState,
                    shouldRefresh: true // Trigger a refresh after reset
                });
            },

            updateSalesData: (salesData: { month: string; sales: number }[]) => {
                set({ salesData });
            },

            updateStats: (partialStats: Partial<DashboardStats>) => {
                set((state) => ({
                    stats: {
                        ...state.stats,
                        ...partialStats
                    }
                }));
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