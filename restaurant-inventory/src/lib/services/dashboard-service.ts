import { inventoryService } from "./inventory-service";
import { salesService } from "./sales-service";
import { format, subMonths, startOfMonth, endOfMonth, subDays } from "date-fns";
import { CategoryStat, InventoryItem, DashboardStats, Sale } from "@/lib/types";
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
import { supabase } from "@/lib/supabase";

// Helper function to create icon elements
const createIconElement = (Icon: IconType) => {
    return React.createElement(Icon, { className: "h-5 w-5 text-white" });
};

interface SaleRecord {
    created_at: string;
    total_amount: number;
}

interface InventoryAlert {
    id: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
    expiryDate: string | null;
    type: 'low_stock' | 'expiring';
}

interface RecentActivity {
    action: string;
    item: string;
    timestamp: string;
    user: string;
}

interface InventoryChange {
    id: string;
    created_at: string;
    quantity_change: number;
    inventory_items: {
        name: string;
    } | null;
    users: {
        email: string;
    } | null;
}

interface InventoryItemRecord {
    id: string;
    quantity: number;
    unit_price: number;
    category: string;
}

interface SaleWithTotalAmount {
    total_amount: number;
}

// Define RecentSale interface
interface RecentSale {
    id: string;
    date: string;
    amount: number;
    customer: string;
}

// Define DashboardData interface for the return type of fetchDashboardData
interface DashboardData {
    stats: DashboardStats;
    salesData: { month: string; sales: number }[];
    categoryStats: CategoryStat[];
    recentActivity: RecentActivity[];
    inventoryAlerts: InventoryAlert[];
    topSellingItems: { name: string; quantity: number }[];
}

async function getBusinessProfileId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: businessProfileData, error: profileError } = await supabase
        .from('business_profile_users')
        .select('business_profile_id')
        .eq('user_id', user.id)
        .single();

    if (profileError) throw profileError;
    if (!businessProfileData) throw new Error("No business profile found");

    return businessProfileData.business_profile_id;
}

export async function fetchMonthlySales(): Promise<{ month: string; sales: number }[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        const currentYear = new Date().getFullYear();
        const { data, error } = await supabase
            .from('sales')
            .select('total_amount, created_at')
            .eq('business_profile_id', businessProfileId)
            .gte('created_at', `${currentYear}-01-01`)
            .lte('created_at', `${currentYear}-12-31`);

        if (error) {
            console.error('Error fetching monthly sales:', error);
            throw error;
        }

        // Group by month and sum
        const salesByMonth: Record<string, number> = {};

        (data || []).forEach((sale) => {
            const month = new Date(sale.created_at).toLocaleString('default', { month: 'short' });
            salesByMonth[month] = (salesByMonth[month] || 0) + sale.total_amount;
        });

        // Convert to array of { month, sales }
        return Object.entries(salesByMonth).map(([month, total]) => ({
            month,
            sales: total,
        }));
    } catch (error) {
        console.error('Error in fetchMonthlySales:', error);
        return [];
    }
}

export async function fetchSalesGrowth(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();

        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);
        const sixtyDaysAgo = subDays(today, 60);

        // Get sales for current period (last 30 days)
        const { data: currentPeriodData, error: currentError } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('business_profile_id', businessProfileId)
            .gte('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'))
            .lte('created_at', format(today, 'yyyy-MM-dd'));

        if (currentError) throw currentError;

        // Get sales for previous period (30-60 days ago)
        const { data: previousPeriodData, error: previousError } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('business_profile_id', businessProfileId)
            .gte('created_at', format(sixtyDaysAgo, 'yyyy-MM-dd'))
            .lt('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'));

        if (previousError) throw previousError;

        // Calculate totals
        const currentTotal = currentPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + sale.total_amount, 0) || 0;
        const previousTotal = previousPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + sale.total_amount, 0) || 0;

        // Calculate growth rate
        if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
        return ((currentTotal - previousTotal) / previousTotal) * 100;
    } catch (error) {
        console.error('Error calculating sales growth:', error);
        throw error;
    }
}

export async function fetchLowStockCount(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();

        const { data, error } = await supabase
            .from('ingredients')
            .select('id')
            .eq('business_profile_id', businessProfileId)
            .lt('quantity', 'reorder_level');

        if (error) throw error;
        return data.length;
    } catch (error) {
        console.error('Error fetching low stock count:', error);
        throw error;
    }
}

export async function fetchInventoryValue(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();

        const { data, error } = await supabase
            .from('ingredients')
            .select('quantity, cost')
            .eq('business_profile_id', businessProfileId);

        if (error) throw error;

        return data.reduce((total: number, item: { quantity: number; cost: number }) => {
            return total + (item.quantity * item.cost);
        }, 0);
    } catch (error) {
        console.error('Error fetching inventory value:', error);
        throw error;
    }
}

export async function fetchCategoryStats(): Promise<CategoryStat[]> {
    try {
        const businessProfileId = await getBusinessProfileId();

        const { data, error } = await supabase
            .from('ingredients')
            .select('category')
            .eq('business_profile_id', businessProfileId);

        if (error) throw error;

        // Group items by category and count
        const categories = data.reduce((acc: { [key: string]: number }, item: { category: string }) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        // Convert to array format with random change values
        return Object.entries(categories).map(([name, count], index) => ({
            id: index.toString(),
            name,
            count,
            change: Math.floor(Math.random() * 11) - 5, // Random value between -5 and 5
            icon: React.createElement('div'), // Placeholder icon
            color: 'bg-primary',
        }));
    } catch (error) {
        console.error('Error fetching category stats:', error);
        throw error;
    }
}

export async function fetchRecentActivity(): Promise<RecentActivity[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        // Since inventory_impact doesn't have business_profile_id, we'll use mock data
        // TODO: Update when inventory_impact schema is updated
        return [
            {
                action: "Added 5 of",
                item: "Fresh Salmon",
                timestamp: new Date().toISOString(),
                user: "System",
            },
            {
                action: "Updated stock of",
                item: "Organic Tomatoes",
                timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
                user: "System",
            },
            {
                action: "Removed 2 of",
                item: "Whole Milk",
                timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
                user: "System",
            },
        ];
    } catch (error) {
        console.error('Error in fetchRecentActivity:', error);
        return [];
    }
}

export async function fetchRecentSales(): Promise<RecentSale[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        const { data, error } = await supabase
            .from('sales')
            .select('id, created_at, total_amount, customer_name')
            .eq('business_profile_id', businessProfileId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching recent sales:', error);
            throw error;
        }

        return (data || []).map(sale => ({
            id: sale.id,
            date: sale.created_at,
            amount: sale.total_amount,
            customer: sale.customer_name || 'Anonymous',
        }));
    } catch (error) {
        console.error('Error in fetchRecentSales:', error);
        return [];
    }
}

/**
 * Fetch inventory alerts (low stock and expiring items)
 */
export async function fetchInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        // Get low stock items - using explicit cast for numeric comparison
        const { data: lowStockItems, error: lowStockError } = await supabase
            .from('ingredients')
            .select('id, name, quantity, reorder_level, expiry_date')
            .eq('business_profile_id', businessProfileId)
            .not('reorder_level', 'is', null)
            .filter('quantity', 'lt', 'reorder_level')
            .order('name');

        if (lowStockError) {
            console.error('Error fetching low stock items:', lowStockError);
            throw lowStockError;
        }

        // Get soon to expire items
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + 7); // 7 days from now

        const { data: expiringItems, error: expiryError } = await supabase
            .from('ingredients')
            .select('id, name, quantity, reorder_level, expiry_date')
            .eq('business_profile_id', businessProfileId)
            .not('expiry_date', 'is', null)
            .lte('expiry_date', thresholdDate.toISOString())
            .order('expiry_date');

        if (expiryError) {
            console.error('Error fetching expiring items:', expiryError);
            throw expiryError;
        }

        // Format low stock alerts
        const lowStockAlerts: InventoryAlert[] = (lowStockItems || []).map(item => ({
            id: item.id,
            name: item.name,
            currentStock: item.quantity,
            reorderLevel: item.reorder_level,
            expiryDate: item.expiry_date,
            type: 'low_stock'
        }));

        // Format expiry alerts
        const expiryAlerts: InventoryAlert[] = (expiringItems || []).map(item => ({
            id: item.id,
            name: item.name,
            currentStock: item.quantity,
            reorderLevel: item.reorder_level || 0,
            expiryDate: item.expiry_date,
            type: 'expiring'
        }));

        // Combine both types of alerts
        return [...lowStockAlerts, ...expiryAlerts];
    } catch (error) {
        console.error('Error in fetchInventoryAlerts:', error);
        return [];
    }
}

export async function fetchTopSellingItems(): Promise<{ name: string; quantity: number }[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            return [];
        }

        // Since sales_items table doesn't exist, return mock data for now
        // TODO: Implement actual sales items tracking when the table is created
        return [
            { name: "Chicken Breast", quantity: 42 },
            { name: "Tomatoes", quantity: 36 },
            { name: "Onions", quantity: 28 },
            { name: "Potatoes", quantity: 25 },
            { name: "Rice", quantity: 20 }
        ];
    } catch (error) {
        console.error('Error in fetchTopSellingItems:', error);
        return [];
    }
}

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
    fetchMonthlySales: async (): Promise<{ currentMonthSales: number; monthlySalesData: { month: string; sales: number }[] }> => {
        try {
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                return { currentMonthSales: 0, monthlySalesData: [] };
            }

            const { data, error } = await supabase
                .from('sales')
                .select('created_at, total_amount')
                .eq('business_profile_id', businessProfileId)
                .gte('created_at', format(subDays(new Date(), 30), 'yyyy-MM-dd'));

            if (error) throw error;

            // Group sales by day and calculate totals
            const salesByDay = new Map<string, number>();
            data?.forEach((sale: SaleRecord) => {
                const day = format(new Date(sale.created_at), 'MMM dd');
                salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total_amount);
            });

            // Convert to array and sort by date
            const monthlySalesData = Array.from(salesByDay.entries())
                .map(([month, total]) => ({ month, sales: total }))
                .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

            // Calculate current month sales
            const currentMonthSales = monthlySalesData.reduce((sum: number, sale: { sales: number }) => sum + sale.sales, 0);

            return {
                currentMonthSales,
                monthlySalesData,
            };
        } catch (error) {
            console.error('Error fetching monthly sales:', error);
            throw error;
        }
    },

    // Calculate sales growth percentage
    fetchSalesGrowth: async (): Promise<number> => {
        try {
            const businessProfileId = await getBusinessProfileId();

            const today = new Date();
            const thirtyDaysAgo = subDays(today, 30);
            const sixtyDaysAgo = subDays(today, 60);

            // Get sales for current period (last 30 days)
            const { data: currentPeriodData, error: currentError } = await supabase
                .from('sales')
                .select('total_amount')
                .eq('business_profile_id', businessProfileId)
                .gte('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'))
                .lte('created_at', format(today, 'yyyy-MM-dd'));

            if (currentError) throw currentError;

            // Get sales for previous period (30-60 days ago)
            const { data: previousPeriodData, error: previousError } = await supabase
                .from('sales')
                .select('total_amount')
                .eq('business_profile_id', businessProfileId)
                .gte('created_at', format(sixtyDaysAgo, 'yyyy-MM-dd'))
                .lt('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'));

            if (previousError) throw previousError;

            // Calculate totals
            const currentTotal = currentPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + sale.total_amount, 0) || 0;
            const previousTotal = previousPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + sale.total_amount, 0) || 0;

            // Calculate growth rate
            if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
            return ((currentTotal - previousTotal) / previousTotal) * 100;
        } catch (error) {
            console.error('Error calculating sales growth:', error);
            throw error;
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

    // Fetch top selling items
    fetchTopSellingItems: async (): Promise<{ name: string; quantity: number }[]> => {
        try {
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) {
                return [];
            }

            // Since sales_items table doesn't exist, return mock data for now
            // TODO: Implement actual sales items tracking when the table is created
            return [
                { name: "Chicken Breast", quantity: 42 },
                { name: "Tomatoes", quantity: 36 },
                { name: "Onions", quantity: 28 },
                { name: "Potatoes", quantity: 25 },
                { name: "Rice", quantity: 20 }
            ];
        } catch (error) {
            console.error('Error in fetchTopSellingItems:', error);
            return [];
        }
    },

    // Fetch recent sales
    fetchRecentSales: async (): Promise<Sale[]> => {
        try {
            const businessProfileId = await getBusinessProfileId();

            const { data, error } = await supabase
                .from('sales')
                .select(`
                    *,
                    sale_items (
                        id,
                        quantity,
                        unit_price,
                        total_price,
                        dishes (name)
                    )
                `)
                .eq('business_profile_id', businessProfileId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching recent sales:', error);
            throw error;
        }
    },

    // Fetch all dashboard data in parallel
    fetchDashboardData: async (): Promise<DashboardData> => {
        try {
            const [
                monthlySalesData,
                salesGrowth,
                inventoryAlerts,
                topSellingItems,
                recentActivity,
                categoryStats
            ] = await Promise.all([
                dashboardService.fetchMonthlySales(),
                dashboardService.fetchSalesGrowth(),
                fetchInventoryAlerts(),
                fetchTopSellingItems(),
                fetchRecentActivity(),
                dashboardService.fetchCategoryStats()
            ]);

            // Format the data to match the expected structure in the dashboard page
            return {
                stats: {
                    totalInventoryValue: await dashboardService.fetchInventoryValue(),
                    lowStockItems: await dashboardService.fetchLowStockCount(),
                    monthlySales: monthlySalesData.currentMonthSales,
                    salesGrowth
                },
                salesData: monthlySalesData.monthlySalesData,
                categoryStats,
                recentActivity,
                inventoryAlerts,
                topSellingItems
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Return default values to prevent UI crashes
            return {
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
                topSellingItems: []
            };
        }
    },
};
