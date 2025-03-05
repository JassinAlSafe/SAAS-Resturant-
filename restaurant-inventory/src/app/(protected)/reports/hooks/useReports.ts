import { useState, useEffect } from "react";
import { format, subDays, differenceInDays, eachDayOfInterval } from "date-fns";
import { useCurrency } from "@/lib/currency-context";
import {
    DateRangeType,
    TabType,
    SalesData,
    TopDishesData,
    InventoryUsageData,
    DateRange
} from "../types";
import { exportSalesReport, exportInventoryReport } from "../utils/exportUtils";

export const useReports = () => {
    const [activeTab, setActiveTab] = useState<TabType>("sales");
    const [dateRange, setDateRange] = useState<DateRangeType>("week");
    const [isLoading, setIsLoading] = useState(true);
    const [customDateRange, setCustomDateRange] = useState<DateRange>({
        from: undefined,
        to: undefined
    });
    const [previousPeriodData, setPreviousPeriodData] = useState({
        totalSales: 9350,
        avgDailySales: 1335.71,
        totalOrders: 365,
        avgOrderValue: 25.75
    });

    // Get currency formatter
    const { formatCurrency } = useCurrency();

    // Simulate fetching data from API
    useEffect(() => {
        // Show loading state
        setIsLoading(true);

        // In a real app, this would be an API call to Supabase
        const fetchTimeout = setTimeout(() => {
            // Also update previous period data
            setPreviousPeriodData({
                totalSales: 9350,
                avgDailySales: 1335.71,
                totalOrders: 365,
                avgOrderValue: 25.75
            });

            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(fetchTimeout);
    }, [dateRange, customDateRange]);

    // Generate dates for the selected range
    const getDateLabels = () => {
        if (dateRange === "custom" && customDateRange.from && customDateRange.to) {
            // For custom date range, generate labels for each day in the range
            const days = eachDayOfInterval({
                start: customDateRange.from,
                end: customDateRange.to
            });
            return days.map(date => format(date, "MMM dd"));
        }

        // For predefined ranges
        const days = dateRange === "week" ? 7 : dateRange === "month" ? 30 : 90;
        return Array.from({ length: days })
            .map((_, i) => {
                const date = subDays(new Date(), i);
                return format(date, "MMM dd");
            })
            .reverse();
    };

    // Get the number of days in the current range for calculating averages
    const getDaysInRange = () => {
        if (dateRange === "custom" && customDateRange.from && customDateRange.to) {
            return differenceInDays(customDateRange.to, customDateRange.from) + 1;
        }

        return dateRange === "week" ? 7 : dateRange === "month" ? 30 : 90;
    };

    // Calculate metrics based on the date range
    const calculateMetrics = () => {
        // In a real app, these would be calculated from actual data
        const totalSales = 10500;
        const daysInRange = getDaysInRange();
        const avgDailySales = totalSales / daysInRange;
        const totalOrders = 420;
        const avgOrderValue = totalSales / totalOrders;

        return {
            totalSales,
            avgDailySales,
            totalOrders,
            avgOrderValue
        };
    };

    // Get the metrics for the current period
    const metrics = calculateMetrics();

    // Calculate percentage changes
    const getPercentageChange = (current: number, previous: number) => {
        if (previous === 0) return "0%";
        const change = ((current - previous) / previous) * 100;
        return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
    };

    // Prepare chart data based on the date range
    // In a real application, this would come from your API
    const salesData: SalesData = {
        labels: getDateLabels().slice(0, 7), // Just show first 7 days for demo
        datasets: [
            {
                label: "Sales",
                data: [1250, 1420, 1350, 1650, 1480, 1600, 1750],
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
            },
        ],
    };

    // Top dishes data for the pie chart
    const topDishesData: TopDishesData = {
        labels: [
            "Margherita Pizza",
            "Spaghetti Bolognese",
            "Chicken Alfredo",
            "Caesar Salad",
            "Other",
        ],
        datasets: [
            {
                label: "Sales",
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.7)",
                    "rgba(16, 185, 129, 0.7)",
                    "rgba(245, 158, 11, 0.7)",
                    "rgba(239, 68, 68, 0.7)",
                    "rgba(107, 114, 128, 0.7)",
                ],
                borderWidth: 1,
            },
        ],
    };

    // Inventory usage data for the line chart
    const inventoryUsageData: InventoryUsageData = {
        labels: getDateLabels().slice(0, 7), // Just show first 7 days for demo
        datasets: [
            {
                label: "Tomatoes (kg)",
                data: [5, 4.5, 4.8, 5.2, 4.7, 5.0, 5.5],
                borderColor: "rgb(239, 68, 68)",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                tension: 0.3,
            },
            {
                label: "Chicken (kg)",
                data: [3.2, 3.5, 3.3, 3.8, 3.6, 3.9, 4.1],
                borderColor: "rgb(16, 185, 129)",
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                tension: 0.3,
            },
            {
                label: "Flour (kg)",
                data: [8, 7.5, 7.8, 8.2, 7.9, 8.3, 8.5],
                borderColor: "rgb(245, 158, 11)",
                backgroundColor: "rgba(245, 158, 11, 0.5)",
                tension: 0.3,
            },
        ],
    };

    // Handler that calls the appropriate export function based on active tab
    const handleExportReport = () => {
        if (activeTab === "sales") {
            exportSalesReport(salesData, topDishesData, dateRange, formatCurrency);
        } else if (activeTab === "inventory") {
            exportInventoryReport(inventoryUsageData, dateRange);
        }
    };

    return {
        activeTab,
        setActiveTab,
        dateRange,
        setDateRange,
        customDateRange,
        setCustomDateRange,
        isLoading,
        salesData,
        topDishesData,
        inventoryUsageData,
        formatCurrency,
        handleExportReport,
        metrics,
        previousPeriodData,
        getPercentageChange
    };
}; 