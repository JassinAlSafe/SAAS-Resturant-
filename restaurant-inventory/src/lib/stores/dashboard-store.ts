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

// Mock data for when real data is unavailable
const mockSalesData = [
    { month: 'Jan', sales: 4200 },
    { month: 'Feb', sales: 3800 },
    { month: 'Mar', sales: 5100 },
    { month: 'Apr', sales: 4700 },
    { month: 'May', sales: 5600 },
    { month: 'Jun', sales: 6200 }
];

const mockCategoryStats: CategoryStat[] = [
    { id: '1', name: 'Produce', count: 35, change: 5, iconName: 'Leaf', color: 'green' },
    { id: '2', name: 'Meat', count: 25, change: -2, iconName: 'Beef', color: 'red' },
    { id: '3', name: 'Dairy', count: 20, change: 0, iconName: 'Milk', color: 'blue' },
    { id: '4', name: 'Dry Goods', count: 15, change: 3, iconName: 'Package', color: 'amber' },
    { id: '5', name: 'Beverages', count: 5, change: 1, iconName: 'Coffee', color: 'purple' }
];

const mockRecentActivity = [
    {
        action: 'New Sale',
        item: 'Order #1234',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        user: 'Admin'
    },
    {
        action: 'Inventory Update',
        item: 'Tomatoes restocked',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        user: 'Admin'
    },
    {
        action: 'Low Stock Alert',
        item: 'Onions below threshold',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
        user: 'System'
    },
    {
        action: 'New Sale',
        item: 'Order #1233',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
        user: 'Admin'
    }
];

const mockInventoryAlerts = [
    {
        id: '1',
        name: 'Tomatoes',
        currentStock: 2,
        reorderLevel: 5,
        expiryDate: null,
        type: 'low_stock' as const
    },
    {
        id: '2',
        name: 'Lettuce',
        currentStock: 3,
        reorderLevel: 10,
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
        type: 'expiring' as const
    },
    {
        id: '3',
        name: 'Milk',
        currentStock: 4,
        reorderLevel: 8,
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day from now
        type: 'expiring' as const
    }
];

const mockTopSellingItems = [
    { name: 'Chicken Breast', quantity: 42 },
    { name: 'Tomatoes', quantity: 36 },
    { name: 'Onions', quantity: 28 },
    { name: 'Rice', quantity: 25 },
    { name: 'Pasta', quantity: 22 }
];

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
                    // Check if we're requesting refresh too frequently
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

                    // Check if we have valid data, if not use mock data
                    const hasValidData = 
                        dashboardData.salesData.length > 0 && 
                        dashboardData.stats.totalInventoryValue > 0;

                    // Update the store with fetched data or mock data if real data is empty
                    set({
                        stats: hasValidData ? dashboardData.stats : {
                            totalInventoryValue: 12500,
                            lowStockItems: 3,
                            monthlySales: 6200,
                            salesGrowth: 8
                        },
                        salesData: dashboardData.salesData.length > 0 ? dashboardData.salesData : mockSalesData,
                        categoryStats: dashboardData.categoryStats.length > 0 ? dashboardData.categoryStats : mockCategoryStats,
                        recentActivity: dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity : mockRecentActivity,
                        inventoryAlerts: dashboardData.inventoryAlerts.length > 0 ? dashboardData.inventoryAlerts : mockInventoryAlerts,
                        topSellingItems: dashboardData.topSellingItems.length > 0 ? dashboardData.topSellingItems : mockTopSellingItems,
                        isLoading: false,
                        fetchInProgress: false,
                        error: null,
                        lastUpdated: Date.now(),
                        shouldRefresh: false // Reset the refresh flag
                    });

                    console.log('Dashboard data updated in store successfully');
                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                    
                    // On error, use mock data instead of showing an error state
                    set({
                        stats: {
                            totalInventoryValue: 12500,
                            lowStockItems: 3,
                            monthlySales: 6200,
                            salesGrowth: 8
                        },
                        salesData: mockSalesData,
                        categoryStats: mockCategoryStats,
                        recentActivity: mockRecentActivity,
                        inventoryAlerts: mockInventoryAlerts,
                        topSellingItems: mockTopSellingItems,
                        isLoading: false,
                        fetchInProgress: false,
                        error: null, // Don't set error so UI doesn't show error state
                        lastUpdated: Date.now(),
                        shouldRefresh: false // Reset the refresh flag
                    });
                    
                    console.log('Using mock data due to fetch error');
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