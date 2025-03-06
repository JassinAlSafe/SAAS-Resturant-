import { useState, useEffect, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { TabType } from '../types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { reportsService, ReportMetrics } from '@/lib/services/reports-service';
import { ChartData } from 'chart.js';

export const useReports = () => {
    // Tab state with useEffect to handle hydration
    const [activeTab, setActiveTab] = useState<TabType>('sales');
    const [storedTab, setStoredTab] = useLocalStorage<TabType>('reports-active-tab', 'sales');

    // Sync state with localStorage after hydration
    useEffect(() => {
        setActiveTab(storedTab);
    }, [storedTab]);

    // Update both states when tab changes
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        setStoredTab(tab);
    }, [setStoredTab]);

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
    const [error, setError] = useState<Error | null>(null);
    const [salesData, setSalesData] = useState<ChartData<"bar"> | null>(null);
    const [topDishesData, setTopDishesData] = useState<ChartData<"pie"> | null>(null);
    const [inventoryUsageData, setInventoryUsageData] = useState<ChartData<"line"> | null>(null);
    const [previousPeriodData, setPreviousPeriodData] = useState<ReportMetrics | null>(null);
    const [metrics, setMetrics] = useState<ReportMetrics>({
        totalSales: 0,
        avgDailySales: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        grossProfit: 0,
        profitMargin: 0
    });

    // Format currency based on user locale
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }, []);

    // Calculate percentage change
    const getPercentageChange = useCallback((current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    }, []);

    // Fetch data based on active tab and date range
    const fetchData = useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        setIsLoading(true);
        setError(null);

        try {
            if (activeTab === 'sales') {
                // Fetch current period data
                const { chartData, metrics: currentMetrics } = await reportsService.getSalesData(dateRange);
                setSalesData(chartData);
                setMetrics(currentMetrics);

                // Fetch top dishes data
                const topDishes = await reportsService.getTopDishes(dateRange);
                setTopDishesData(topDishes);

                // Calculate previous period for comparison
                const daysDifference = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                const previousRange = {
                    from: subDays(dateRange.from, daysDifference),
                    to: subDays(dateRange.from, 1)
                };
                const { metrics: previousMetrics } = await reportsService.getSalesData(previousRange);
                setPreviousPeriodData(previousMetrics);
            } else {
                // Fetch inventory usage data
                const usageData = await reportsService.getInventoryUsage(dateRange);
                setInventoryUsageData(usageData);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
            setIsLoading(false);
        }
    }, [activeTab, dateRange]);

    // Handle export report
    const handleExportReport = useCallback(() => {
        if (!dateRange?.from) return;

        const fileName = `${activeTab}-report-${format(dateRange.from, 'yyyy-MM-dd')}`;
        const data = activeTab === 'sales' ? salesData : inventoryUsageData;

        if (!data) return;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${fileName}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [activeTab, dateRange, salesData, inventoryUsageData]);

    // Fetch data when tab or date range changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        activeTab,
        setActiveTab: handleTabChange,
        dateRange,
        setDateRange,
        customDateRange,
        setCustomDateRange,
        isLoading,
        error,
        salesData,
        topDishesData,
        inventoryUsageData,
        formatCurrency,
        handleExportReport,
        metrics,
        previousPeriodData,
        getPercentageChange,
        refetchData: fetchData
    };
};