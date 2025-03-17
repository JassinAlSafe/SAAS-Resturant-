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

/**
 * Main service for fetching all dashboard data.
 * This acts as an aggregator for all the individual dashboard data services.
 */
export const dashboardService = {
    /**
     * Fetch all dashboard data
     */
    async fetchDashboardData() {
        try {
            console.log('Fetching all dashboard data...');

            // Fetch sales statistics
            const { currentMonthSales, monthlySalesData } = await fetchMonthlySales();
            const salesGrowth = await fetchSalesGrowth();

            // Fetch inventory statistics
            const lowStockCount = await fetchLowStockCount();
            const inventoryValue = await fetchInventoryValue();
            const categoryStats = await fetchCategoryStats();

            // Fetch detailed data
            const recentActivity = await fetchRecentActivity();
            const recentSales = await fetchRecentSales();
            const topSellingItems = await fetchTopSellingItems();
            const inventoryAlerts = await fetchInventoryAlerts();

            // Return consolidated data
            return {
                salesData: {
                    currentMonthSales,
                    monthlySalesData,
                    salesGrowth
                },
                stats: {
                    totalInventoryValue: inventoryValue,
                    lowStockItems: lowStockCount,
                    monthlySales: currentMonthSales,
                    salesGrowth,
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
            throw error;
        }
    },

    /**
     * Fetch only sales data for the dashboard
     */
    async fetchSalesData() {
        try {
            console.log('Fetching sales data...');

            const { currentMonthSales, monthlySalesData } = await fetchMonthlySales();
            const salesGrowth = await fetchSalesGrowth();

            return {
                currentMonthSales,
                monthlySalesData,
                salesGrowth
            };
        } catch (error) {
            console.error('Error fetching sales data:', error);
            throw error;
        }
    }
};

export default dashboardService;
