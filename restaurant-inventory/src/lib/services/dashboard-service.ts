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
import { ActivityItem, InventoryAlert, RecentActivity } from "./dashboard/types";
import { CategoryStat } from "@/lib/types";

// Add simple caching to reduce duplicate fetches
const CACHE_DURATION = 60000; // 1 minute cache

// Define properly typed interfaces instead of using 'any'
interface TopSellingItem {
    name: string;
    quantity: number;
}

interface RecentSale {
    id: string;
    date: string;
    amount: number;
    customer: string;
}

interface DashboardDataShape {
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
    };
    categoryStats: CategoryStat[];
    recentActivity: RecentActivity[];
    recentSales: RecentSale[];
    topSellingItems: TopSellingItem[];
    inventoryAlerts: InventoryAlert[];
    lastUpdated: string;
}

let dashboardCache = {
    data: null as DashboardDataShape | null,
    timestamp: 0
};

/**
 * Main service for fetching all dashboard data.
 * This acts as an aggregator for all the individual dashboard data services.
 */
export const dashboardService = {
    /**
     * Fetch all dashboard data
     */
    async fetchDashboardData(): Promise<DashboardDataShape> {
        try {
            // Check cache first
            const now = Date.now();
            if (dashboardCache.data && now - dashboardCache.timestamp < CACHE_DURATION) {
                return dashboardCache.data;
            }

            // Fetch sales statistics - handle these in parallel
            const [
                salesData,
                salesGrowth,
                lowStockCount,
                inventoryValue,
                categoryStats,
                activityData,
                recentSales,
                topSellingItems,
                inventoryAlerts
            ] = await Promise.all([
                fetchMonthlySales().catch(() => ({ currentMonthSales: 0, monthlySalesData: [] })),
                fetchSalesGrowth().catch(() => 0),
                fetchLowStockCount().catch(() => 0),
                fetchInventoryValue().catch(() => 0),
                fetchCategoryStats().catch(() => [] as CategoryStat[]),
                fetchRecentActivity().catch(() => [] as ActivityItem[]),
                fetchRecentSales().catch(() => [] as RecentSale[]),
                fetchTopSellingItems().catch(() => [] as TopSellingItem[]),
                fetchInventoryAlerts().catch(() => [] as InventoryAlert[])
            ]);

            // Destructure sales data
            const { currentMonthSales, monthlySalesData } = salesData as {
                currentMonthSales: number;
                monthlySalesData: { month: string; sales: number }[]
            };

            // Convert activity data to proper format for the dashboard
            const recentActivity = (activityData as ActivityItem[]).map(item => ({
                action: item.title || '',
                item: item.description || '',
                timestamp: item.date || '',
                user: ''
            }));

            // Create the consolidated response
            const result: DashboardDataShape = {
                salesData: {
                    currentMonthSales,
                    monthlySalesData,
                    salesGrowth
                },
                stats: {
                    totalInventoryValue: inventoryValue,
                    lowStockItems: lowStockCount,
                    monthlySales: currentMonthSales,
                    salesGrowth
                },
                categoryStats,
                recentActivity,
                recentSales,
                topSellingItems,
                inventoryAlerts,
                lastUpdated: new Date().toISOString()
            };

            // Update cache
            dashboardCache = {
                data: result,
                timestamp: now
            };

            return result;
        } catch (error) {
            // Handle auth errors specifically
            if (error instanceof Error) {
                if (error.message.includes('JWT') ||
                    error.message.includes('auth') ||
                    error.message.includes('session')) {
                    throw new Error('Authentication required to fetch dashboard data');
                }
            }

            throw error;
        }
    },

    /**
     * Fetch only sales data for the dashboard
     */
    async fetchSalesData() {
        try {
            // Get from cache if available
            if (dashboardCache.data && Date.now() - dashboardCache.timestamp < CACHE_DURATION) {
                return dashboardCache.data.salesData;
            }

            const { currentMonthSales, monthlySalesData } = await fetchMonthlySales();
            const salesGrowth = await fetchSalesGrowth();

            return {
                currentMonthSales,
                monthlySalesData,
                salesGrowth
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('JWT') ||
                    error.message.includes('auth') ||
                    error.message.includes('session')) {
                    throw new Error('Authentication required to fetch sales data');
                }
            }

            throw error;
        }
    },

    // Clear cache (useful for forced refreshes)
    clearCache() {
        dashboardCache = {
            data: null,
            timestamp: 0
        };
    }
};

export default dashboardService;
