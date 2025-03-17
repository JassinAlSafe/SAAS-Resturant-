import { inventoryService } from "./inventory-service";
import { format, subDays } from "date-fns";
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

// Helper function to get default months data for charts
const getDefaultMonthsData = () => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(today.getMonth() - 5 + i);
        return {
            month: format(date, 'MMM'),
            sales: 0
        };
    });
};

// Helper function to log query details for debugging
const logQueryDetails = (businessProfileId: string, startDate: string, endDate: string) => {
    console.log('=== Dashboard Sales Query Details ===');
    console.log('Business Profile ID:', businessProfileId);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('===================================');
};

interface SaleRecord {
    created_at: string;
    total_amount: number;
}

interface SaleWithTotalAmount {
    total_amount: number;
}

interface SaleWithDate {
    date?: string;
    created_at?: string;
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

async function getBusinessProfileId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

    return profile?.id || null;
}

export async function fetchMonthlySales(): Promise<{ currentMonthSales: number; monthlySalesData: { month: string; sales: number }[] }> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) {
            console.log('No business profile ID found for dashboard sales query');
            return {
                currentMonthSales: 0,
                monthlySalesData: getDefaultMonthsData()
            };
        }

        // Get data for the past 6 months
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start from the 1st day of the month

        const startDate = format(sixMonthsAgo, 'yyyy-MM-dd');
        const endDate = format(today, 'yyyy-MM-dd');

        // Log query details for debugging
        logQueryDetails(businessProfileId, startDate, endDate);

        const { data, error } = await supabase
            .from('sales')
            .select('created_at, total_amount, date')
            .eq('business_profile_id', businessProfileId)
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching monthly sales:', error);
            return {
                currentMonthSales: 0,
                monthlySalesData: getDefaultMonthsData()
            };
        }

        // Log the results for debugging
        console.log(`Found ${data?.length || 0} sales records for date range ${startDate} to ${endDate}`);

        // If no data using created_at filter, try using the date field instead
        if (!data || data.length === 0) {
            console.log('No data found using created_at filter, trying date field instead...');

            const { data: dateData, error: dateError } = await supabase
                .from('sales')
                .select('created_at, total_amount, date')
                .eq('business_profile_id', businessProfileId)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: true });

            if (dateError) {
                console.error('Error fetching sales using date field:', dateError);
                return {
                    currentMonthSales: 0,
                    monthlySalesData: getDefaultMonthsData()
                };
            }

            if (dateData && dateData.length > 0) {
                console.log(`Found ${dateData.length} sales records using date field`);
                console.log('First few records:', dateData.slice(0, 3));

                // Group sales by month and calculate totals
                const salesByMonth = new Map<string, number>();

                // First, initialize with zero values for the past 6 months
                for (let i = 0; i < 6; i++) {
                    const date = new Date();
                    date.setMonth(today.getMonth() - 5 + i);
                    const monthKey = format(date, 'MMM');
                    salesByMonth.set(monthKey, 0);
                }

                // Then add actual sales data using date field
                dateData.forEach((sale: SaleWithDate) => {
                    const saleDate = new Date(sale.date || sale.created_at || new Date().toISOString());
                    const monthKey = format(saleDate, 'MMM');
                    salesByMonth.set(monthKey, (salesByMonth.get(monthKey) || 0) + sale.total_amount);
                });

                // Convert to array of { month, sales }
                const monthlySalesData = Array.from(salesByMonth.entries()).map(([month, total]) => ({
                    month,
                    sales: total,
                }));

                // Get current month sales (current calendar month)
                const currentMonthKey = format(today, 'MMM');
                const currentMonthSales = salesByMonth.get(currentMonthKey) || 0;

                return {
                    currentMonthSales,
                    monthlySalesData,
                };
            } else {
                console.log('No data found using date field either');
                return {
                    currentMonthSales: 0,
                    monthlySalesData: getDefaultMonthsData()
                };
            }
        }

        if (data && data.length > 0) {
            console.log('First few records:', data.slice(0, 3));
        }

        // Group sales by month and calculate totals
        const salesByMonth = new Map<string, number>();

        // First, initialize with zero values for the past 6 months
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(today.getMonth() - 5 + i);
            const monthKey = format(date, 'MMM');
            salesByMonth.set(monthKey, 0);
        }

        // Then add actual sales data
        data.forEach((sale: SaleRecord) => {
            const saleDate = new Date(sale.created_at);
            const monthKey = format(saleDate, 'MMM');
            salesByMonth.set(monthKey, (salesByMonth.get(monthKey) || 0) + sale.total_amount);
        });

        // Convert to array of { month, sales }
        const monthlySalesData = Array.from(salesByMonth.entries()).map(([month, total]) => ({
            month,
            sales: total,
        }));

        // Get current month sales (current calendar month)
        const currentMonthKey = format(today, 'MMM');
        const currentMonthSales = salesByMonth.get(currentMonthKey) || 0;

        return {
            currentMonthSales,
            monthlySalesData,
        };
    } catch (error) {
        console.error('Error fetching monthly sales:', error);
        return {
            currentMonthSales: 0,
            monthlySalesData: getDefaultMonthsData()
        };
    }
}

export async function fetchSalesGrowth(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) return 0;

        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);
        const sixtyDaysAgo = subDays(today, 60);

        // Format dates
        const currentStartDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
        const currentEndDate = format(today, 'yyyy-MM-dd');
        const previousStartDate = format(sixtyDaysAgo, 'yyyy-MM-dd');
        const previousEndDate = format(thirtyDaysAgo, 'yyyy-MM-dd');

        console.log('Fetching sales growth data...');
        console.log('Current period:', currentStartDate, 'to', currentEndDate);
        console.log('Previous period:', previousStartDate, 'to', previousEndDate);

        // Get sales for current period (last 30 days) using created_at
        const { data: currentPeriodData, error: currentError } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('business_profile_id', businessProfileId)
            .gte('created_at', currentStartDate)
            .lte('created_at', currentEndDate);

        if (currentError) {
            console.error('Error fetching current period sales:', currentError);
            return 0;
        }

        // Get sales for previous period (30-60 days ago) using created_at
        const { data: previousPeriodData, error: previousError } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('business_profile_id', businessProfileId)
            .gte('created_at', previousStartDate)
            .lt('created_at', previousEndDate);

        if (previousError) {
            console.error('Error fetching previous period sales:', previousError);
            return 0;
        }

        console.log(`Found ${currentPeriodData?.length || 0} current period sales and ${previousPeriodData?.length || 0} previous period sales using created_at`);

        // If we didn't find data using created_at, try using date field
        if ((!currentPeriodData || currentPeriodData.length === 0) &&
            (!previousPeriodData || previousPeriodData.length === 0)) {
            console.log('No sales data found using created_at, trying date field...');

            // Get sales for current period using date field
            const { data: currentDateData, error: currentDateError } = await supabase
                .from('sales')
                .select('total_amount')
                .eq('business_profile_id', businessProfileId)
                .gte('date', currentStartDate)
                .lte('date', currentEndDate);

            if (currentDateError) {
                console.error('Error fetching current period sales using date field:', currentDateError);
                return 0;
            }

            // Get sales for previous period using date field
            const { data: previousDateData, error: previousDateError } = await supabase
                .from('sales')
                .select('total_amount')
                .eq('business_profile_id', businessProfileId)
                .gte('date', previousStartDate)
                .lt('date', previousEndDate);

            if (previousDateError) {
                console.error('Error fetching previous period sales using date field:', previousDateError);
                return 0;
            }

            console.log(`Found ${currentDateData?.length || 0} current period sales and ${previousDateData?.length || 0} previous period sales using date field`);

            // Calculate totals using date field data
            const currentTotal = currentDateData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;
            const previousTotal = previousDateData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;

            console.log('Current period total (using date):', currentTotal);
            console.log('Previous period total (using date):', previousTotal);

            // Calculate growth rate
            if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
            return ((currentTotal - previousTotal) / previousTotal) * 100;
        }

        // Calculate totals using created_at data
        const currentTotal = currentPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;
        const previousTotal = previousPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;

        console.log('Current period total (using created_at):', currentTotal);
        console.log('Previous period total (using created_at):', previousTotal);

        // Calculate growth rate
        if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
        return ((currentTotal - previousTotal) / previousTotal) * 100;
    } catch (error) {
        console.error('Error calculating sales growth:', error);
        return 0;
    }
}

/**
 * Fetch low stock items more reliably by handling comparison in JS
 */
export async function fetchLowStockItemsReliably(): Promise<{ id: string; name: string; quantity: number; reorderLevel: number }[]> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) return [];

        // Get all ingredients with non-null reorder_level
        const { data, error } = await supabase
            .from('ingredients')
            .select('id, name, quantity, reorder_level')
            .eq('business_profile_id', businessProfileId)
            .not('reorder_level', 'is', null)
            .order('name');

        if (error) {
            console.error('Error fetching ingredients:', error);
            throw error;
        }

        // Filter low stock items in JavaScript
        const lowStockItems = data
            .filter(item => typeof item.quantity === 'number' &&
                typeof item.reorder_level === 'number' &&
                item.quantity < item.reorder_level)
            .map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                reorderLevel: item.reorder_level
            }));

        return lowStockItems;
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        return [];
    }
}

// Update the existing fetchLowStockCount function to use the reliable method
export async function fetchLowStockCount(): Promise<number> {
    try {
        const lowStockItems = await fetchLowStockItemsReliably();
        return lowStockItems.length;
    } catch (error) {
        console.error('Error fetching low stock count:', error);
        return 0;
    }
}

export async function fetchInventoryValue(): Promise<number> {
    try {
        const businessProfileId = await getBusinessProfileId();
        if (!businessProfileId) return 0;

        const { data, error } = await supabase
            .from('ingredients')
            .select('quantity, cost')
            .eq('business_profile_id', businessProfileId);

        if (error) {
            console.error('Error fetching inventory value:', error);
            return 0;
        }

        if (!data || data.length === 0) return 0;

        return data.reduce((total: number, item: { quantity: number; cost: number }) => {
            return total + (item.quantity * (item.cost || 0));
        }, 0);
    } catch (error) {
        console.error('Error fetching inventory value:', error);
        return 0;
    }
}

export async function fetchCategoryStats(): Promise<CategoryStat[]> {
    try {
        const items = await inventoryService.getItems();

        // If no items found, return default categories
        if (!items || items.length === 0) {
            return [
                { id: "1", name: "Meat", count: 0, change: 0, icon: createIconElement(FiShoppingBag), color: "bg-primary" },
                { id: "2", name: "Produce", count: 0, change: 0, icon: createIconElement(FiHome), color: "bg-green-500" },
                { id: "3", name: "Dairy", count: 0, change: 0, icon: createIconElement(FiSettings), color: "bg-blue-500" },
                { id: "4", name: "Dry Goods", count: 0, change: 0, icon: createIconElement(FiBarChart2), color: "bg-amber-500" },
                { id: "5", name: "Seafood", count: 0, change: 0, icon: createIconElement(FiShoppingCart), color: "bg-purple-500" }
            ];
        }

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

        if (Object.keys(categories).length === 0) {
            return [
                { id: "1", name: "Meat", count: 0, change: 0, icon: createIconElement(FiShoppingBag), color: "bg-primary" },
                { id: "2", name: "Produce", count: 0, change: 0, icon: createIconElement(FiHome), color: "bg-green-500" },
                { id: "3", name: "Dairy", count: 0, change: 0, icon: createIconElement(FiSettings), color: "bg-blue-500" },
                { id: "4", name: "Dry Goods", count: 0, change: 0, icon: createIconElement(FiBarChart2), color: "bg-amber-500" },
                { id: "5", name: "Seafood", count: 0, change: 0, icon: createIconElement(FiShoppingCart), color: "bg-purple-500" }
            ];
        }

        return Object.entries(categories).map(([name, data], index) => ({
            id: index.toString(),
            name,
            count: data.count,
            change: getRandomChange(),
            icon: iconMap[name] || createIconElement(FiPackage),
            color: colorMap[name] || "bg-gray-500",
        }));
    } catch (error) {
        console.error('Error fetching category stats:', error);
        // Return default categories if there's an error
        return [
            { id: "1", name: "Meat", count: 0, change: 0, icon: createIconElement(FiShoppingBag), color: "bg-primary" },
            { id: "2", name: "Produce", count: 0, change: 0, icon: createIconElement(FiHome), color: "bg-green-500" },
            { id: "3", name: "Dairy", count: 0, change: 0, icon: createIconElement(FiSettings), color: "bg-blue-500" },
            { id: "4", name: "Dry Goods", count: 0, change: 0, icon: createIconElement(FiBarChart2), color: "bg-amber-500" },
            { id: "5", name: "Seafood", count: 0, change: 0, icon: createIconElement(FiShoppingCart), color: "bg-purple-500" }
        ];
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

        // Use the reliable method to get low stock items
        const lowStockItems = await fetchLowStockItemsReliably();

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
            return lowStockItems.map(item => ({
                id: item.id,
                name: item.name,
                currentStock: item.quantity,
                reorderLevel: item.reorderLevel,
                expiryDate: null,
                type: 'low_stock'
            }));
        }

        // Format low stock alerts
        const lowStockAlerts: InventoryAlert[] = lowStockItems.map(item => ({
            id: item.id,
            name: item.name,
            currentStock: item.quantity,
            reorderLevel: item.reorderLevel,
            expiryDate: null,
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
                return sum + item.quantity * (item.cost_per_unit || item.cost || 0);
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
            return await fetchLowStockCount();
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
                console.log('No business profile ID found for dashboard sales query');
                return {
                    currentMonthSales: 0,
                    monthlySalesData: getDefaultMonthsData()
                };
            }

            // Get data for the past 6 months
            const today = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(today.getMonth() - 5);
            sixMonthsAgo.setDate(1); // Start from the 1st day of the month

            const startDate = format(sixMonthsAgo, 'yyyy-MM-dd');
            const endDate = format(today, 'yyyy-MM-dd');

            // Log query details for debugging
            logQueryDetails(businessProfileId, startDate, endDate);

            const { data, error } = await supabase
                .from('sales')
                .select('created_at, total_amount, date')
                .eq('business_profile_id', businessProfileId)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching monthly sales:', error);
                return {
                    currentMonthSales: 0,
                    monthlySalesData: getDefaultMonthsData()
                };
            }

            // Log the results for debugging
            console.log(`Found ${data?.length || 0} sales records for date range ${startDate} to ${endDate}`);

            // If no data using created_at filter, try using the date field instead
            if (!data || data.length === 0) {
                console.log('No data found using created_at filter, trying date field instead...');

                const { data: dateData, error: dateError } = await supabase
                    .from('sales')
                    .select('created_at, total_amount, date')
                    .eq('business_profile_id', businessProfileId)
                    .gte('date', startDate)
                    .lte('date', endDate)
                    .order('date', { ascending: true });

                if (dateError) {
                    console.error('Error fetching sales using date field:', dateError);
                    return {
                        currentMonthSales: 0,
                        monthlySalesData: getDefaultMonthsData()
                    };
                }

                if (dateData && dateData.length > 0) {
                    console.log(`Found ${dateData.length} sales records using date field`);
                    console.log('First few records:', dateData.slice(0, 3));

                    // Group sales by month and calculate totals
                    const salesByMonth = new Map<string, number>();

                    // First, initialize with zero values for the past 6 months
                    for (let i = 0; i < 6; i++) {
                        const date = new Date();
                        date.setMonth(today.getMonth() - 5 + i);
                        const monthKey = format(date, 'MMM');
                        salesByMonth.set(monthKey, 0);
                    }

                    // Then add actual sales data using date field
                    dateData.forEach((sale: SaleWithDate) => {
                        const saleDate = new Date(sale.date || sale.created_at || new Date().toISOString());
                        const monthKey = format(saleDate, 'MMM');
                        salesByMonth.set(monthKey, (salesByMonth.get(monthKey) || 0) + sale.total_amount);
                    });

                    // Convert to array of { month, sales }
                    const monthlySalesData = Array.from(salesByMonth.entries()).map(([month, total]) => ({
                        month,
                        sales: total,
                    }));

                    // Get current month sales (current calendar month)
                    const currentMonthKey = format(today, 'MMM');
                    const currentMonthSales = salesByMonth.get(currentMonthKey) || 0;

                    return {
                        currentMonthSales,
                        monthlySalesData,
                    };
                } else {
                    console.log('No data found using date field either');
                    return {
                        currentMonthSales: 0,
                        monthlySalesData: getDefaultMonthsData()
                    };
                }
            }

            if (data && data.length > 0) {
                console.log('First few records:', data.slice(0, 3));
            }

            // Group sales by month and calculate totals
            const salesByMonth = new Map<string, number>();

            // First, initialize with zero values for the past 6 months
            for (let i = 0; i < 6; i++) {
                const date = new Date();
                date.setMonth(today.getMonth() - 5 + i);
                const monthKey = format(date, 'MMM');
                salesByMonth.set(monthKey, 0);
            }

            // Then add actual sales data
            data.forEach((sale: SaleRecord) => {
                const saleDate = new Date(sale.created_at);
                const monthKey = format(saleDate, 'MMM');
                salesByMonth.set(monthKey, (salesByMonth.get(monthKey) || 0) + sale.total_amount);
            });

            // Convert to array of { month, sales }
            const monthlySalesData = Array.from(salesByMonth.entries()).map(([month, total]) => ({
                month,
                sales: total,
            }));

            // Get current month sales (current calendar month)
            const currentMonthKey = format(today, 'MMM');
            const currentMonthSales = salesByMonth.get(currentMonthKey) || 0;

            return {
                currentMonthSales,
                monthlySalesData,
            };
        } catch (error) {
            console.error('Error fetching monthly sales:', error);
            return {
                currentMonthSales: 0,
                monthlySalesData: getDefaultMonthsData()
            };
        }
    },

    // Calculate sales growth percentage
    fetchSalesGrowth: async (): Promise<number> => {
        try {
            const businessProfileId = await getBusinessProfileId();
            if (!businessProfileId) return 0;

            const today = new Date();
            const thirtyDaysAgo = subDays(today, 30);
            const sixtyDaysAgo = subDays(today, 60);

            // Format dates
            const currentStartDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
            const currentEndDate = format(today, 'yyyy-MM-dd');
            const previousStartDate = format(sixtyDaysAgo, 'yyyy-MM-dd');
            const previousEndDate = format(thirtyDaysAgo, 'yyyy-MM-dd');

            console.log('Fetching sales growth data...');
            console.log('Current period:', currentStartDate, 'to', currentEndDate);
            console.log('Previous period:', previousStartDate, 'to', previousEndDate);

            // Get sales for current period (last 30 days) using created_at
            const { data: currentPeriodData, error: currentError } = await supabase
                .from('sales')
                .select('total_amount')
                .eq('business_profile_id', businessProfileId)
                .gte('created_at', currentStartDate)
                .lte('created_at', currentEndDate);

            if (currentError) {
                console.error('Error fetching current period sales:', currentError);
                return 0;
            }

            // Get sales for previous period (30-60 days ago) using created_at
            const { data: previousPeriodData, error: previousError } = await supabase
                .from('sales')
                .select('total_amount')
                .eq('business_profile_id', businessProfileId)
                .gte('created_at', previousStartDate)
                .lt('created_at', previousEndDate);

            if (previousError) {
                console.error('Error fetching previous period sales:', previousError);
                return 0;
            }

            console.log(`Found ${currentPeriodData?.length || 0} current period sales and ${previousPeriodData?.length || 0} previous period sales using created_at`);

            // If we didn't find data using created_at, try using date field
            if ((!currentPeriodData || currentPeriodData.length === 0) &&
                (!previousPeriodData || previousPeriodData.length === 0)) {
                console.log('No sales data found using created_at, trying date field...');

                // Get sales for current period using date field
                const { data: currentDateData, error: currentDateError } = await supabase
                    .from('sales')
                    .select('total_amount')
                    .eq('business_profile_id', businessProfileId)
                    .gte('date', currentStartDate)
                    .lte('date', currentEndDate);

                if (currentDateError) {
                    console.error('Error fetching current period sales using date field:', currentDateError);
                    return 0;
                }

                // Get sales for previous period using date field
                const { data: previousDateData, error: previousDateError } = await supabase
                    .from('sales')
                    .select('total_amount')
                    .eq('business_profile_id', businessProfileId)
                    .gte('date', previousStartDate)
                    .lt('date', previousEndDate);

                if (previousDateError) {
                    console.error('Error fetching previous period sales using date field:', previousDateError);
                    return 0;
                }

                console.log(`Found ${currentDateData?.length || 0} current period sales and ${previousDateData?.length || 0} previous period sales using date field`);

                // Calculate totals using date field data
                const currentTotal = currentDateData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;
                const previousTotal = previousDateData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;

                console.log('Current period total (using date):', currentTotal);
                console.log('Previous period total (using date):', previousTotal);

                // Calculate growth rate
                if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
                return ((currentTotal - previousTotal) / previousTotal) * 100;
            }

            // Calculate totals using created_at data
            const currentTotal = currentPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;
            const previousTotal = previousPeriodData?.reduce((sum: number, sale: SaleWithTotalAmount) => sum + (sale.total_amount || 0), 0) || 0;

            console.log('Current period total (using created_at):', currentTotal);
            console.log('Previous period total (using created_at):', previousTotal);

            // Calculate growth rate
            if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
            return ((currentTotal - previousTotal) / previousTotal) * 100;
        } catch (error) {
            console.error('Error calculating sales growth:', error);
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
            if (!businessProfileId) return [];

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

            if (error) {
                console.error('Error fetching recent sales:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching recent sales:', error);
            return [];
        }
    },

    // Fetch all dashboard data in parallel
    fetchDashboardData: async (): Promise<DashboardData> => {
        try {
            console.log('Fetching dashboard data...');
            // Create safer promise resolvers that never reject
            const safePromise = async <T>(promise: Promise<T>, defaultValue: T, label: string): Promise<T> => {
                try {
                    console.log(`Starting to fetch ${label}...`);
                    const result = await promise;
                    console.log(`Successfully fetched ${label}:`, result);
                    return result;
                } catch (error) {
                    console.error(`Error in ${label} fetch:`, error);
                    return defaultValue;
                }
            };

            // Default values
            const defaultSalesData = {
                currentMonthSales: 0,
                monthlySalesData: getDefaultMonthsData()
            };

            const defaultCategories = [
                { id: "1", name: "Meat", count: 0, change: 0, icon: createIconElement(FiShoppingBag), color: "bg-primary" },
                { id: "2", name: "Produce", count: 0, change: 0, icon: createIconElement(FiHome), color: "bg-green-500" },
                { id: "3", name: "Dairy", count: 0, change: 0, icon: createIconElement(FiSettings), color: "bg-blue-500" },
                { id: "4", name: "Dry Goods", count: 0, change: 0, icon: createIconElement(FiBarChart2), color: "bg-amber-500" },
                { id: "5", name: "Seafood", count: 0, change: 0, icon: createIconElement(FiShoppingCart), color: "bg-purple-500" }
            ];

            // Fetch all data in parallel with safety wrappers
            const [
                monthlySalesData,
                salesGrowth,
                inventoryAlerts,
                topSellingItems,
                recentActivity,
                categoryStats,
                totalInventoryValue,
                lowStockCount
            ] = await Promise.all([
                safePromise(dashboardService.fetchMonthlySales(), defaultSalesData, 'monthly sales data'),
                safePromise(dashboardService.fetchSalesGrowth(), 0, 'sales growth'),
                safePromise(fetchInventoryAlerts(), [], 'inventory alerts'),
                safePromise(fetchTopSellingItems(), [], 'top selling items'),
                safePromise(fetchRecentActivity(), [], 'recent activity'),
                safePromise(dashboardService.fetchCategoryStats(), defaultCategories, 'category stats'),
                safePromise(dashboardService.fetchInventoryValue(), 0, 'total inventory value'),
                safePromise(dashboardService.fetchLowStockCount(), 0, 'low stock count')
            ]);

            // Ensure we have valid sales data
            const validSalesData = monthlySalesData.monthlySalesData && monthlySalesData.monthlySalesData.length > 0
                ? monthlySalesData.monthlySalesData
                : getDefaultMonthsData();

            console.log('Monthly sales data for dashboard:', validSalesData);
            console.log('Current month sales:', monthlySalesData.currentMonthSales);

            // Format the data to match the expected structure in the dashboard page
            const dashboardData = {
                stats: {
                    totalInventoryValue,
                    lowStockItems: lowStockCount,
                    monthlySales: monthlySalesData.currentMonthSales || 0,
                    salesGrowth: salesGrowth || 0
                },
                salesData: validSalesData,
                categoryStats: categoryStats && categoryStats.length > 0 ? categoryStats : defaultCategories,
                recentActivity: recentActivity || [],
                inventoryAlerts: inventoryAlerts || [],
                topSellingItems: topSellingItems || []
            };

            console.log('Final dashboard data:', dashboardData);
            return dashboardData;
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
                salesData: getDefaultMonthsData(),
                categoryStats: [
                    { id: "1", name: "Meat", count: 0, change: 0, icon: createIconElement(FiShoppingBag), color: "bg-primary" },
                    { id: "2", name: "Produce", count: 0, change: 0, icon: createIconElement(FiHome), color: "bg-green-500" },
                    { id: "3", name: "Dairy", count: 0, change: 0, icon: createIconElement(FiSettings), color: "bg-blue-500" },
                    { id: "4", name: "Dry Goods", count: 0, change: 0, icon: createIconElement(FiBarChart2), color: "bg-amber-500" },
                    { id: "5", name: "Seafood", count: 0, change: 0, icon: createIconElement(FiShoppingCart), color: "bg-purple-500" }
                ],
                recentActivity: [],
                inventoryAlerts: [],
                topSellingItems: []
            };
        }
    },
};
