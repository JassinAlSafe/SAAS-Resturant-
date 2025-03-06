import { useState, useEffect, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, subDays } from 'date-fns';
import { TabType } from '../types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Mock data generator functions
import {
    generateSalesData,
    generateTopDishesData,
    generateInventoryData
} from '../utils/mockDataGenerators';

export const useReports = () => {
    // Tab state
    const [activeTab, setActiveTab] = useLocalStorage<TabType>('reports-active-tab', 'sales');

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
    const [salesData, setSalesData] = useState<any>(null);
    const [topDishesData, setTopDishesData] = useState<any>(null);
    const [inventoryUsageData, setInventoryUsageData] = useState<any>(null);
    const [previousPeriodData, setPreviousPeriodData] = useState<any>(null);
    const [metrics, setMetrics] = useState({
        totalSales: 0,
        avgDailySales: 0,
        totalOrders: 0,
        avgOrderValue: 0
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
            // In a real app, these would be API calls
            setTimeout(() => {
                if (activeTab === 'sales') {
                    // Generate sales data
                    const sales = generateSalesData(dateRange);
                    setSalesData(sales.currentPeriod);

                    // Generate top dishes data
                    const dishes = generateTopDishesData();
                    setTopDishesData(dishes);

                    // Generate previous period metrics for comparison
                    const previousRange = {
                        from: subDays(dateRange.from!, dateRange.to!.getTime() - dateRange.from!.getTime()),
                        to: subDays(dateRange.from!, 1)
                    };
                    const previousPeriod = generateSalesData(previousRange);
                    setPreviousPeriodData(previousPeriod.metrics);

                    // Update metrics
                    setMetrics(sales.metrics);
                } else {
                    // Generate inventory data
                    const inventory = generateInventoryData(dateRange);
                    // Ensure we have valid data
                    if (inventory && inventory.labels && inventory.labels.length > 0) {
                        setInventoryUsageData(inventory);
                    } else {
                        // Set default empty data structure
                        setInventoryUsageData({
                            labels: [],
                            datasets: [
                                {
                                    label: "No Data",
                                    data: [],
                                    borderColor: "rgb(200, 200, 200)",
                                    backgroundColor: "rgba(200, 200, 200, 0.5)",
                                },
                            ],
                        });
                    }
                }

                setIsLoading(false);
            }, 1000); // Simulate network delay
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
            setIsLoading(false);
        }
    }, [activeTab, dateRange]);

    // Refresh data
    const refetchData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Handle export report
    const handleExportReport = useCallback(() => {
        // Logic to export report data as CSV or PDF
        const fileName = `${activeTab}-report-${format(dateRange?.from || new Date(), 'yyyy-MM-dd')}`;

        // In a real app, this would generate and download a file
        console.log(`Exporting ${fileName}`);

        // Mock export by creating a simple text download
        const data = activeTab === 'sales'
            ? JSON.stringify(salesData, null, 2)
            : JSON.stringify(inventoryUsageData, null, 2);

        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
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
        setActiveTab,
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
        refetchData
    };
};