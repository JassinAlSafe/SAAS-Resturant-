"use client";

import { useState, useEffect, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { format, subDays, parseISO } from 'date-fns';
import { TabType, InventoryUsageData } from '../types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { reportsService, ReportMetrics } from '@/lib/services/reports-service';
import { ChartData } from 'chart.js';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase/client';
import { useCurrency } from '@/lib/currency';

// Define more specific types to replace 'any'
type ActivityLogItem = {
    id: string;
    timestamp: Date | string;
    action: string;
    description: string;
    userId?: string;
};

interface ExecutiveSummary {
    currentSales: number;
    previousSales: number;
    salesGrowth: number;
    profitMargin: number;
    lowStockCount: number;
    outOfStockCount: number;
    criticalItems: Array<{
        name: string;
        depletion: string;
        depleted: boolean;
        warning: boolean;
    }>;
    topDishes: string[];
    recentActivity: ActivityLogItem[];
}

export const useReports = () => {
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();

    // Tab state with useEffect to handle hydration
    const [activeTab, setActiveTab] = useState<TabType>('executive');
    const [storedTab, setStoredTab] = useLocalStorage<TabType>('reports-active-tab', 'executive');

    // Sync state with localStorage after hydration
    useEffect(() => {
        setActiveTab(storedTab);
    }, [storedTab]);

    // Date range state
    const today = new Date();
    const defaultFrom = subDays(today, 7);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: defaultFrom,
        to: today
    });
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>({
        from: defaultFrom,
        to: today
    });

    // Data states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [salesData, setSalesData] = useState<ChartData<"bar"> | null>(null);
    const [topDishesData, setTopDishesData] = useState<ChartData<"pie"> | null>(null);
    const [previousPeriodData, setPreviousPeriodData] = useState<ReportMetrics | null>(null);
    const [metrics, setMetrics] = useState<ReportMetrics>({
        totalSales: 0,
        avgDailySales: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        grossProfit: 0,
        profitMargin: 0
    });

    const [inventoryData, setInventoryData] = useState<InventoryUsageData>({
        labels: [],
        datasets: [],
        inventory: [],
    });

    const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);

    // Calculate percentage change
    const getPercentageChange = useCallback((current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    }, []);

    // Helper function to generate random colors for chart
    const generateRandomColor = useCallback((alpha = 1) => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }, []);

    // Fetch inventory data directly from Supabase using existing tables
    const fetchInventoryData = useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) {
            setError("Please select a date range");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Format dates for API
            const fromDate = format(dateRange.from, "yyyy-MM-dd");
            const toDate = format(dateRange.to, "yyyy-MM-dd");

            console.log('Fetching inventory data for range:', { fromDate, toDate });

            // Fetch ingredients data
            const { data: ingredients, error: ingredientsError } = await supabase
                .from("ingredients")
                .select("id, name, quantity, unit, category, cost");

            console.log('Ingredients fetch result:', {
                count: ingredients?.length || 0,
                error: ingredientsError?.message
            });

            if (ingredientsError) {
                throw new Error(ingredientsError.message);
            }

            if (!ingredients || ingredients.length === 0) {
                console.log('No ingredients found, using fallback data');

                // Create fallback sample data
                const fallbackLabels = ["Mar 21", "Mar 22", "Mar 23", "Mar 24", "Mar 25", "Mar 26", "Mar 27", "Mar 28"];
                const fallbackDatasets = [
                    {
                        label: "Tomatoes",
                        data: [10, 12, 8, 15, 6, 10, 8, 12],
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: "Onions",
                        data: [5, 8, 6, 9, 7, 4, 8, 6],
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: "Chicken",
                        data: [15, 12, 18, 14, 16, 19, 13, 17],
                        backgroundColor: "rgba(255, 206, 86, 0.5)",
                        borderColor: "rgba(255, 206, 86, 1)",
                        borderWidth: 2,
                        tension: 0.4
                    }
                ];

                const fallbackInventory = [
                    {
                        id: "ingredient-1",
                        name: "Tomatoes",
                        category: "Produce",
                        quantity: 25,
                        unit: "kg",
                        usageRate: "2.5",
                        depleteDate: "10 days",
                        status: "normal" as const,
                        cost: 3.99,
                        stock: "25 kg",
                        usage: "17.5 kg",
                        depletion: "10.0 days",
                        depleted: false,
                        warning: false
                    },
                    {
                        id: "ingredient-2",
                        name: "Onions",
                        category: "Produce",
                        quantity: 15,
                        unit: "kg",
                        usageRate: "1.8",
                        depleteDate: "8 days",
                        status: "normal" as const,
                        cost: 2.49,
                        stock: "15 kg",
                        usage: "12.6 kg",
                        depletion: "8.0 days",
                        depleted: false,
                        warning: false
                    },
                    {
                        id: "ingredient-3",
                        name: "Chicken",
                        category: "Meat",
                        quantity: 22,
                        unit: "kg",
                        usageRate: "4.2",
                        depleteDate: "5 days",
                        status: "low" as const,
                        cost: 8.99,
                        stock: "22 kg",
                        usage: "29.4 kg",
                        depletion: "5.0 days",
                        depleted: false,
                        warning: true
                    },
                    {
                        id: "ingredient-4",
                        name: "Lettuce",
                        category: "Produce",
                        quantity: 8,
                        unit: "kg",
                        usageRate: "3.0",
                        depleteDate: "2.5 days",
                        status: "critical" as const,
                        cost: 4.50,
                        stock: "8 kg",
                        usage: "21.0 kg",
                        depletion: "2.5 days",
                        depleted: false,
                        warning: false
                    },
                    {
                        id: "ingredient-5",
                        name: "Flour",
                        category: "Dry Goods",
                        quantity: 45,
                        unit: "kg",
                        usageRate: "3.5",
                        depleteDate: "13 days",
                        status: "normal" as const,
                        cost: 1.99,
                        stock: "45 kg",
                        usage: "24.5 kg",
                        depletion: "13.0 days",
                        depleted: false,
                        warning: false
                    },
                    {
                        id: "ingredient-6",
                        name: "Butter",
                        category: "Dairy",
                        quantity: 0,
                        unit: "kg",
                        usageRate: "1.2",
                        depleteDate: "0 days",
                        status: "depleted" as const,
                        cost: 6.99,
                        stock: "0 kg",
                        usage: "8.4 kg",
                        depletion: "0.0 days",
                        depleted: true,
                        warning: false
                    }
                ];

                setInventoryData({
                    labels: fallbackLabels,
                    datasets: fallbackDatasets,
                    inventory: fallbackInventory,
                });
                setIsLoading(false);
                return;
            }

            // Fetch sales data to calculate ingredient usage
            const { data: sales, error: salesError } = await supabase
                .from("sales")
                .select(`
                    id, 
                    dish_id,
                    quantity,
                    date
                `)
                .gte("date", fromDate)
                .lte("date", toDate)
                .order("date", { ascending: true });

            console.log('Sales fetch result:', {
                count: sales?.length || 0,
                error: salesError?.message
            });

            if (salesError) {
                throw new Error(salesError.message);
            }

            // Fetch dish_ingredients to calculate usage
            const { data: dishIngredients, error: dishIngredientsError } = await supabase
                .from("dish_ingredients")
                .select(`
                    dish_id,
                    ingredient_id,
                    quantity
                `);

            console.log('Dish ingredients fetch result:', {
                count: dishIngredients?.length || 0,
                error: dishIngredientsError?.message
            });

            if (dishIngredientsError) {
                throw new Error(dishIngredientsError.message);
            }

            // Group sales by date
            const salesByDate = sales?.reduce((acc, sale) => {
                const dateStr = typeof sale.date === 'string' ? sale.date : format(sale.date, "yyyy-MM-dd");
                if (!acc[dateStr]) {
                    acc[dateStr] = [];
                }
                acc[dateStr].push(sale);
                return acc;
            }, {} as Record<string, { dish_id: string; quantity: number }[]>) || {};

            console.log('Sales grouped by date:', Object.keys(salesByDate).length, 'days');

            // Calculate ingredient usage by date
            const ingredientUsageByDate: Record<string, Record<string, number>> = {};

            // Initialize dates array for chart labels
            const datesInRange: string[] = [];
            const currentDate = new Date(fromDate);
            const endDate = new Date(toDate);

            while (currentDate <= endDate) {
                const dateStr = format(currentDate, "yyyy-MM-dd");
                datesInRange.push(dateStr);
                ingredientUsageByDate[dateStr] = {};

                // Initialize all ingredients with 0 usage for this date
                ingredients.forEach(ingredient => {
                    ingredientUsageByDate[dateStr][ingredient.id] = 0;
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Calculate usage based on sales and dish_ingredients
            Object.entries(salesByDate).forEach(([dateStr, dateSales]) => {
                dateSales.forEach(sale => {
                    const relevantIngredients = dishIngredients?.filter(di => di.dish_id === sale.dish_id) || [];
                    console.log(`Processing sale on ${dateStr}:`, {
                        dishId: sale.dish_id,
                        quantity: sale.quantity,
                        ingredientsUsed: relevantIngredients.length
                    });

                    relevantIngredients.forEach(ingredient => {
                        const usageAmount = (ingredient.quantity || 0) * (sale.quantity || 0);
                        if (ingredientUsageByDate[dateStr] && ingredient.ingredient_id) {
                            ingredientUsageByDate[dateStr][ingredient.ingredient_id] =
                                (ingredientUsageByDate[dateStr][ingredient.ingredient_id] || 0) + usageAmount;
                        }
                    });
                });
            });

            // Prepare data for chart
            const chartLabels = datesInRange.map(date => format(parseISO(date), "MMM d"));

            // Create datasets for each ingredient
            const datasets = ingredients.map(ingredient => {
                const data = datesInRange.map(date =>
                    ingredientUsageByDate[date]?.[ingredient.id] || 0
                );

                return {
                    label: ingredient.name,
                    data,
                    borderColor: generateRandomColor(),
                    backgroundColor: generateRandomColor(0.5),
                    tension: 0.4
                };
            });

            // Calculate inventory status
            const inventory = ingredients.map(ingredient => {
                // Calculate total usage across all dates
                const totalUsage = datesInRange.reduce((sum, date) =>
                    sum + (ingredientUsageByDate[date]?.[ingredient.id] || 0), 0);

                const avgDailyUsage = totalUsage / datesInRange.length || 0.001; // Avoid division by zero
                const daysUntilDepletion = avgDailyUsage > 0
                    ? ingredient.quantity / avgDailyUsage
                    : Infinity;

                // Determine status based on depletion time
                let status: "normal" | "low" | "critical" | "depleted" = "normal";
                if (ingredient.quantity <= 0) {
                    status = "depleted";
                } else if (daysUntilDepletion <= 2) {
                    status = "critical";
                } else if (daysUntilDepletion <= 5) {
                    status = "low";
                }

                return {
                    id: ingredient.id || `ingredient-${ingredient.name}`,
                    name: ingredient.name,
                    category: ingredient.category || "General", // Fallback category
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    usageRate: avgDailyUsage.toFixed(2),
                    depleteDate: daysUntilDepletion < Infinity
                        ? `${daysUntilDepletion.toFixed(1)} days`
                        : "Never",
                    status,
                    cost: ingredient.cost || 0,
                    stock: `${ingredient.quantity} ${ingredient.unit}`,
                    usage: `${totalUsage.toFixed(1)} ${ingredient.unit}`,
                    depletion: `${daysUntilDepletion.toFixed(1)} days`,
                    depleted: daysUntilDepletion <= 2,
                    warning: daysUntilDepletion <= 5 && daysUntilDepletion > 2,
                };
            });

            console.log('Setting inventory data:', {
                labels: chartLabels.length,
                datasets: datasets.length,
                inventory: inventory.length
            });

            setInventoryData({
                labels: chartLabels,
                datasets,
                inventory,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to fetch inventory data";
            console.error('Error in fetchInventoryData:', message);
            setError(message);
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [dateRange, toast, generateRandomColor]);

    // Fetch executive summary data with better error handling
    const fetchExecutiveSummary = useCallback(async () => {
        try {
            setIsLoading(true);
            const summary = await reportsService.getDashboardSummary();
            setExecutiveSummary(summary);
        } catch (error) {
            console.error('Error fetching executive summary:', error);
            // Instead of setting error state, just provide fallback data
            // This prevents the entire UI from showing an error state
            setExecutiveSummary({
                currentSales: 0,
                previousSales: 0,
                salesGrowth: 0,
                profitMargin: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                criticalItems: [],
                topDishes: [],
                recentActivity: []
            });
            // Show toast notification instead of error state
            toast({
                variant: "destructive",
                title: "Executive summary could not be loaded",
                description: "Some data may be unavailable. You can still view individual reports."
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Fetch data based on active tab and date range
    const fetchData = useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        setIsLoading(true);
        setError(null);

        console.log('Fetching data for tab:', activeTab);

        try {
            // Always attempt to fetch executive summary data
            await fetchExecutiveSummary().catch(err => {
                console.warn("Failed to fetch executive summary:", err);
                // Don't set error state here, just log the issue
            });

            if (activeTab === 'sales') {
                try {
                    // Fetch current period data
                    const { chartData, metrics: currentMetrics } = await reportsService.getSalesData(dateRange);
                    setSalesData(chartData);
                    setMetrics(currentMetrics);
                } catch (err) {
                    console.error('Error fetching sales data:', err);
                    setSalesData(null);
                    // Show fallback metrics
                    setMetrics({
                        totalSales: 0,
                        avgDailySales: 0,
                        totalOrders: 0,
                        avgOrderValue: 0,
                        grossProfit: 0,
                        profitMargin: 0
                    });
                }

                try {
                    // Fetch top dishes data
                    const topDishes = await reportsService.getTopDishes(dateRange);
                    setTopDishesData(topDishes);
                } catch (err) {
                    console.error('Error fetching top dishes data:', err);
                    setTopDishesData(null);
                }

                try {
                    // Calculate previous period for comparison
                    const daysDifference = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                    const previousRange = {
                        from: subDays(dateRange.from, daysDifference),
                        to: subDays(dateRange.from, 1)
                    };
                    const { metrics: previousMetrics } = await reportsService.getSalesData(previousRange);
                    setPreviousPeriodData(previousMetrics);
                } catch (err) {
                    console.error('Error fetching previous period data:', err);
                    setPreviousPeriodData({
                        totalSales: 0,
                        avgDailySales: 0,
                        totalOrders: 0,
                        avgOrderValue: 0,
                        grossProfit: 0,
                        profitMargin: 0
                    });
                }
            } else if (activeTab === 'inventory') {
                console.log('Fetching inventory data...');
                try {
                    // Fetch inventory usage data
                    await fetchInventoryData();
                } catch (err) {
                    console.error('Error fetching inventory data:', err);
                    // Don't set error state for this
                }
            }
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, dateRange, fetchInventoryData, fetchExecutiveSummary]);

    // Update both states when tab changes
    const handleTabChange = useCallback((tab: TabType) => {
        console.log('Tab changed to:', tab);
        setActiveTab(tab);
        setStoredTab(tab);

        // Trigger data fetch if we have a valid date range
        if (dateRange?.from && dateRange?.to) {
            console.log('Triggering data fetch for new tab:', tab);
            fetchData();
        }
    }, [setStoredTab, dateRange, fetchData]);

    const handleDateChange = useCallback(
        (newDate: DateRange | undefined) => {
            console.log('Date range changed:', newDate);
            setDateRange(newDate);
            // Only fetch if we have a complete date range
            if (newDate?.from && newDate?.to) {
                fetchData();
            }
        },
        [fetchData]
    );

    // Function to manually refresh data
    const refreshData = useCallback(() => {
        console.log('Manual refresh triggered');
        fetchData();
    }, [fetchData]);

    // Fetch data when tab or date range changes
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            console.log('Effect triggered - fetching data for tab:', activeTab);
            fetchData();
        }
    }, [activeTab, dateRange, fetchData]);

    return {
        activeTab,
        setActiveTab: handleTabChange,
        dateRange,
        setDateRange: handleDateChange,
        customDateRange,
        setCustomDateRange,
        isLoading,
        error,
        salesData,
        topDishesData,
        inventoryUsageData: inventoryData,
        executiveSummary,
        formatCurrency,
        handleExportReport: () => { }, // Placeholder for export functionality
        metrics,
        previousPeriodData,
        getPercentageChange,
        refetchData: fetchData,
        refreshData,
    };
};