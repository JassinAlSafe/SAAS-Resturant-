import { inventoryService } from "./inventory-service";
import { salesService } from "./sales-service";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { DashboardStats, InventoryItem } from "@/lib/types";
import React from "react";
import type { IconType } from "react-icons";
import {
    FiPackage,
    FiShoppingBag,
    FiHome,
    FiSettings,
    FiBarChart2,
    FiShoppingCart
} from "react-icons/fi";

// Helper function to create icon elements
const createIconElement = (Icon: IconType) => {
    return React.createElement(Icon, { className: "h-5 w-5 text-white" });
};

export const dashboardService = {
    // Fetch total inventory value
    fetchInventoryValue: async (): Promise<number> => {
        try {
            const items = await inventoryService.getItems();
            const totalValue = items.reduce((sum: number, item: InventoryItem) => {
                return sum + item.quantity * item.cost_per_unit;
            }, 0);
            return totalValue;
        } catch (error) {
            console.error("Error fetching inventory value:", error);
            return 0;
        }
    },

    // Fetch low stock items count
    fetchLowStockCount: async (): Promise<number> => {
        try {
            const items = await inventoryService.getItems();
            const lowStockCount = items.filter(
                (item: InventoryItem) =>
                    item.quantity <= (item.minimum_stock_level || 0)
            ).length;
            return lowStockCount;
        } catch (error) {
            console.error("Error fetching low stock count:", error);
            return 0;
        }
    },

    // Fetch monthly sales data
    fetchMonthlySales: async (): Promise<{
        currentMonthSales: number;
        monthlySalesData: { month: string; sales: number }[];
    }> => {
        try {
            const sales = await salesService.getSales();
            const now = new Date();

            // Initialize monthly data for the last 6 months
            const monthlyData: { [key: string]: number } = {};
            for (let i = 0; i < 6; i++) {
                const month = subMonths(now, i);
                const monthKey = format(month, "MMM");
                monthlyData[monthKey] = 0;
            }

            // Calculate sales for each month
            let currentMonthTotal = 0;
            sales.forEach((sale) => {
                const saleDate = new Date(sale.date);
                const monthKey = format(saleDate, "MMM");

                if (monthlyData[monthKey] !== undefined) {
                    monthlyData[monthKey] += sale.totalAmount;
                }

                // Check if sale is in current month
                const currentMonthStart = startOfMonth(now);
                const currentMonthEnd = endOfMonth(now);
                if (saleDate >= currentMonthStart && saleDate <= currentMonthEnd) {
                    currentMonthTotal += sale.totalAmount;
                }
            });

            // Convert to array format for chart
            const monthlySalesData = Object.entries(monthlyData)
                .map(([month, sales]) => ({ month, sales }))
                .reverse(); // Reverse to show oldest first

            return {
                currentMonthSales: currentMonthTotal,
                monthlySalesData,
            };
        } catch (error) {
            console.error("Error fetching monthly sales:", error);
            return {
                currentMonthSales: 0,
                monthlySalesData: [],
            };
        }
    },

    // Calculate sales growth percentage
    fetchSalesGrowth: async (): Promise<number> => {
        try {
            const sales = await salesService.getSales();
            const now = new Date();

            // Current month range
            const currentMonthStart = startOfMonth(now);
            const currentMonthEnd = endOfMonth(now);

            // Previous month range
            const prevMonthStart = startOfMonth(subMonths(now, 1));
            const prevMonthEnd = endOfMonth(subMonths(now, 1));

            // Calculate totals
            let currentMonthTotal = 0;
            let prevMonthTotal = 0;

            sales.forEach((sale) => {
                const saleDate = new Date(sale.date);

                if (saleDate >= currentMonthStart && saleDate <= currentMonthEnd) {
                    currentMonthTotal += sale.totalAmount;
                } else if (saleDate >= prevMonthStart && saleDate <= prevMonthEnd) {
                    prevMonthTotal += sale.totalAmount;
                }
            });

            // Calculate growth percentage
            if (prevMonthTotal === 0) return 0;
            const growthPercentage =
                ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
            return parseFloat(growthPercentage.toFixed(1));
        } catch (error) {
            console.error("Error calculating sales growth:", error);
            return 0;
        }
    },

    // Fetch category statistics
    fetchCategoryStats: async () => {
        try {
            const items = await inventoryService.getItems();

            // Group items by category
            const categories: {
                [key: string]: { count: number; items: InventoryItem[] };
            } = {};

            items.forEach((item) => {
                if (!categories[item.category]) {
                    categories[item.category] = { count: 0, items: [] };
                }
                categories[item.category].count += 1;
                categories[item.category].items.push(item);
            });

            // Convert to required format
            const iconMap: { [key: string]: React.ReactNode } = {
                "Meat": createIconElement(FiShoppingBag),
                "Produce": createIconElement(FiHome),
                "Dairy": createIconElement(FiSettings),
                "Dry Goods": createIconElement(FiBarChart2),
                "Seafood": createIconElement(FiShoppingCart),
            };

            const colorMap: { [key: string]: string } = {
                "Meat": "bg-primary",
                "Produce": "bg-green-500",
                "Dairy": "bg-blue-500",
                "Dry Goods": "bg-amber-500",
                "Seafood": "bg-purple-500",
            };

            // Calculate change (this would normally come from historical data)
            // For now, we'll use a random value between -5 and 5
            const getRandomChange = () => Math.floor(Math.random() * 11) - 5;

            return Object.entries(categories).map(([name, data], index) => ({
                id: index.toString(),
                name,
                count: data.count,
                change: getRandomChange(),
                icon: iconMap[name] || createIconElement(FiPackage),
                color: colorMap[name] || "bg-gray-500",
            }));
        } catch (error) {
            console.error("Error fetching category stats:", error);
            return [];
        }
    },

    // Mock function to fetch recent activity
    fetchRecentActivity: async () => {
        // This would be replaced with an actual API call
        return [
            {
                action: "Added new item",
                item: "Fresh Salmon",
                timestamp: new Date().toISOString(),
                user: "John Doe",
            },
            {
                action: "Updated stock",
                item: "Organic Tomatoes",
                timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
                user: "Sarah Smith",
            },
            {
                action: "Marked as expired",
                item: "Whole Milk",
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
                user: "Mike Johnson",
            },
        ];
    },

    // Fetch all dashboard data in parallel
    fetchDashboardData: async (): Promise<{
        stats: DashboardStats;
        salesData: { month: string; sales: number }[];
        categoryStats: any[];
        recentActivity: any[];
    }> => {
        try {
            const [
                inventoryValue,
                lowStockCount,
                monthlySalesData,
                salesGrowthData,
                categoryData,
                activityData,
            ] = await Promise.all([
                dashboardService.fetchInventoryValue(),
                dashboardService.fetchLowStockCount(),
                dashboardService.fetchMonthlySales(),
                dashboardService.fetchSalesGrowth(),
                dashboardService.fetchCategoryStats(),
                dashboardService.fetchRecentActivity(),
            ]);

            return {
                stats: {
                    totalInventoryValue: inventoryValue,
                    lowStockItems: lowStockCount,
                    monthlySales: monthlySalesData.currentMonthSales,
                    salesGrowth: salesGrowthData,
                },
                salesData: monthlySalesData.monthlySalesData,
                categoryStats: categoryData,
                recentActivity: activityData,
            };
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            return {
                stats: {
                    totalInventoryValue: 0,
                    lowStockItems: 0,
                    monthlySales: 0,
                    salesGrowth: 0,
                },
                salesData: [],
                categoryStats: [],
                recentActivity: [],
            };
        }
    },
};
