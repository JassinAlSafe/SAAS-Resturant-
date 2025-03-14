"use client";

import { useState, useEffect, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, isValid, startOfMonth } from 'date-fns';
import {
    TabType,
    MetricsData as ReportMetrics
} from '../types/index';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { salesAnalyticsService, inventoryAnalyticsService, executiveDashboardService, InventoryUsageData } from '@/lib/services';
import { ChartData } from 'chart.js';
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from '@/lib/currency-provider';

// Define types not in the main types file
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

type ActivityLogItem = {
    id: string;
    timestamp: Date | string;
    action: string;
    description: string;
    userId?: string;
};

// Define dish type for topDishes
interface DishData {
    name: string;
    revenue: number;
}

// Define critical item type
interface CriticalItem {
    name: string;
    depletion: string;
    depleted: boolean;
    warning?: boolean;
}

// Define a safe DateRange type that guarantees from and to are defined
interface SafeDateRange {
    from: Date;
    to: Date;
}

export const useReports = () => {
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>("executive");
    const [storedTab, setStoredTab] = useLocalStorage<TabType>('reports-active-tab', "executive");

    // Sync state with localStorage after hydration
    useEffect(() => {
        setActiveTab(storedTab);
    }, [storedTab]);

    // Update both states when tab changes
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        setStoredTab(tab);
    }, [setStoredTab]);

    // Date range state - use current month as default instead of last 7 days
    const today = new Date();
    const defaultFrom = startOfMonth(today); // Start of current month
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
        analytics: {
            totalCost: 0,
            averageDailyUsage: {},
            profitableIngredients: [],
            criticalItems: []
        }
    });

    const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
    const [previousPeriodData, setPreviousPeriodData] = useState<ReportMetrics | null>(null);

    // Calculate percentage change
    const getPercentageChange = useCallback((current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    }, []);

    // Validate date range and ensure it's a SafeDateRange
    const validateDateRange = useCallback((range: DateRange | undefined): SafeDateRange => {
        if (!range || !range.from || !range.to || !isValid(range.from) || !isValid(range.to)) {
            // Default to current month if invalid
            return {
                from: startOfMonth(new Date()),
                to: new Date()
            };
        }

        // Ensure "to" is not before "from"
        if (range.to < range.from) {
            return {
                from: range.from,
                to: range.from
            };
        }

        return {
            from: range.from,
            to: range.to
        };
    }, []);

    // Fetch executive summary
    const fetchExecutiveSummary = useCallback(async () => {
        try {
            setIsLoading(true);
            const validRange = validateDateRange(dateRange);

            const summary = await executiveDashboardService.getExecutiveSummary(validRange);

            // Get sales data to extract top dishes if not available in summary
            let topDishesNames: string[] = [];
            try {
                // Check if we already have sales data
                if (!topDishesData || !topDishesData.labels || topDishesData.labels.length === 0) {
                    const salesData = await salesAnalyticsService.getSalesData(validRange);
                    if (salesData.topDishes?.length > 0) {
                        topDishesNames = salesData.topDishes.map((dish: { name: string }) => dish.name);
                    }
                } else if (topDishesData.labels && topDishesData.labels.length > 0) {
                    topDishesNames = topDishesData.labels as string[];
                }
            } catch (error) {
                console.warn('Failed to fetch top dishes data:', error);
            }

            // If no top dishes data available, provide fallback data
            if (topDishesNames.length === 0) {
                topDishesNames = [
                    "Margherita Pizza",
                    "Carbonara Pasta",
                    "Caesar Salad",
                    "Grilled Salmon",
                    "Chicken Parmesan"
                ];
            }

            setExecutiveSummary({
                currentSales: summary.sales.current,
                previousSales: summary.sales.previous,
                salesGrowth: summary.sales.growth,
                profitMargin: summary.sales.profitMargin,
                lowStockCount: summary.inventory.lowStockCount,
                outOfStockCount: summary.inventory.outOfStockCount,
                criticalItems: summary.inventory.criticalItems.map((item: CriticalItem) => ({
                    name: item.name,
                    depletion: item.depletion,
                    depleted: item.depleted,
                    warning: item.warning || false
                })),
                topDishes: topDishesNames,
                recentActivity: []
            });
        } catch (error) {
            console.error('Error fetching executive summary:', error);
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
            toast({
                variant: "destructive",
                title: "Executive summary could not be loaded",
                description: "Some data may be unavailable. You can still view individual reports."
            });
        } finally {
            setIsLoading(false);
        }
    }, [dateRange, toast, validateDateRange, topDishesData]);

    // Fetch data based on active tab and date range
    const fetchData = useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        setIsLoading(true);
        setError(null);

        try {
            // Validate date range
            const validRange = validateDateRange(dateRange);

            // Log the date range being used
            console.log('Fetching data for date range:', {
                from: validRange.from.toISOString(),
                to: validRange.to.toISOString()
            });

            await fetchExecutiveSummary().catch(err => {
                console.warn("Failed to fetch executive summary:", err);
            });

            if (activeTab === 'sales') {
                try {
                    console.log('Fetching sales data...');
                    const salesData = await salesAnalyticsService.getSalesData(validRange);
                    console.log('Sales data received:', salesData);

                    setSalesData(salesData.chartData);

                    // Also set top dishes data
                    setTopDishesData({
                        labels: salesData.topDishes?.map((dish: DishData) => dish.name) || [],
                        datasets: [{
                            label: 'Top Dishes',
                            data: salesData.topDishes?.map((dish: DishData) => dish.revenue) || [],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(255, 206, 86, 0.5)',
                                'rgba(75, 192, 192, 0.5)',
                                'rgba(153, 102, 255, 0.5)',
                            ],
                            borderWidth: 1
                        }]
                    });

                    setMetrics({
                        totalSales: salesData.metrics.totalSales,
                        avgDailySales: salesData.metrics.avgDailySales,
                        totalOrders: salesData.metrics.totalOrders,
                        avgOrderValue: salesData.metrics.avgOrderValue,
                        grossProfit: salesData.metrics.grossProfit,
                        profitMargin: salesData.metrics.profitMargin
                    });

                    // Calculate previous period date range
                    const daysDifference = Math.floor((validRange.to.getTime() - validRange.from.getTime()) / (1000 * 60 * 60 * 24));
                    const previousRange = {
                        from: subDays(validRange.from, daysDifference),
                        to: subDays(validRange.from, 1)
                    };

                    console.log('Fetching previous period data:', {
                        from: previousRange.from.toISOString(),
                        to: previousRange.to.toISOString()
                    });

                    const previousData = await salesAnalyticsService.getSalesData(previousRange);
                    setPreviousPeriodData(previousData.metrics);
                } catch (error) {
                    console.error('Error fetching sales data:', error);
                    setSalesData(null);
                    setTopDishesData(null);
                    setMetrics({
                        totalSales: 0,
                        avgDailySales: 0,
                        totalOrders: 0,
                        avgOrderValue: 0,
                        grossProfit: 0,
                        profitMargin: 0
                    });
                    toast({
                        variant: "destructive",
                        title: "Sales data could not be loaded",
                        description: "Please try again later or contact support if the problem persists."
                    });
                }
            } else if (activeTab === 'inventory') {
                try {
                    console.log('Fetching inventory data...');
                    const inventoryUsageData = await inventoryAnalyticsService.getInventoryUsageData(validRange);
                    console.log('Inventory data received:', inventoryUsageData);

                    // The service now returns a properly structured object that matches our UI expectations
                    setInventoryData(inventoryUsageData);
                } catch (error) {
                    console.error('Error fetching inventory data:', error);
                    // The service now handles errors and returns an empty data structure
                    // so this block should rarely be reached
                    setInventoryData({
                        labels: [],
                        datasets: [],
                        inventory: [],
                        analytics: {
                            totalCost: 0,
                            averageDailyUsage: {},
                            profitableIngredients: [],
                            criticalItems: []
                        }
                    });
                    toast({
                        variant: "destructive",
                        title: "Inventory data could not be loaded",
                        description: "Please try again later or contact support if the problem persists."
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            toast({
                variant: "destructive",
                title: "Failed to load reports",
                description: err instanceof Error ? err.message : "An unknown error occurred"
            });
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, dateRange, fetchExecutiveSummary, toast, validateDateRange]);

    const handleDateChange = useCallback(
        (newDate: DateRange | undefined) => {
            if (!newDate?.from || !newDate?.to) return;

            // Validate the date range
            const validRange = validateDateRange(newDate);
            setDateRange({
                from: validRange.from,
                to: validRange.to
            });
            fetchData();
        },
        [fetchData, validateDateRange]
    );

    // Function to manually refresh data
    const refreshData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Fetch data when tab or date range changes
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            fetchData();
        }
    }, [activeTab, dateRange, fetchData]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, []);

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