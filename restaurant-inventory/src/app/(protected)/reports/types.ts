import { DateRange } from "react-day-picker";
import { ChartData } from "chart.js";

// Tab types
export type TabType = "sales" | "inventory";

// Component Props Types
export interface PageHeaderProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    handleExportReport: () => void;
}

export interface DateRangeSelectorProps {
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    customDateRange: DateRange | undefined;
    setCustomDateRange: (range: DateRange | undefined) => void;
}

export interface SalesAnalyticsViewProps {
    salesData: ChartData<"bar">;
    topDishesData: ChartData<"pie">;
    formatCurrency: (amount: number) => string;
    previousPeriodData: any;
}

export interface InventoryUsageViewProps {
    inventoryUsageData: ChartData<"line">;
}

export interface SalesMetricCardProps {
    title: string;
    value: string | number;
    change: string;
    positive: boolean;
    previousValue?: string | number;
    tooltip?: string;
}

export interface InventoryRowProps {
    name: string;
    stock: string;
    usage: string;
    depletion: string;
    depleted: boolean;
    warning?: boolean;
}

// Data Types
export interface MetricsData {
    totalSales: number;
    avgDailySales: number;
    totalOrders: number;
    avgOrderValue: number;
    grossProfit: number;
    profitMargin: number;
}

export interface ReportFilters {
    searchTerm: string;
    category: string;
    minAmount?: number;
    maxAmount?: number;
}
