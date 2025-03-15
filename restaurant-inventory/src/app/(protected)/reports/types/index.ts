// Report Types
export interface ReportMetrics {
    totalSales: number;
    avgDailySales: number;
    totalOrders: number;
    avgOrderValue: number;
    grossProfit: number;
    profitMargin: number;
}

export type DateRangeType = "week" | "month" | "quarter" | "custom";
export type TabType = "sales" | "inventory" | "executive";

// Date Range Type - Use react-day-picker's DateRange instead of defining our own
import { DateRange } from 'react-day-picker';
export type { DateRange };

// Chart Data Types
export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface SalesData extends ChartData {
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    }>;
}

export interface TopDishesData extends ChartData {
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
    }>;
}

export interface InventoryUsageData extends ChartData {
    datasets: Array<{
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        tension: number;
    }>;
    inventory?: InventoryItem[];
}

// Components Props Types
export interface SalesMetricCardProps {
    title: string;
    value: string;
    change: string;
    positive: boolean;
    previousValue?: string;
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

export interface PageHeaderProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    handleExportReport: () => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    customDateRange: DateRange | undefined;
    setCustomDateRange: (range: DateRange | undefined) => void;
}

export interface DateRangeSelectorProps {
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    customDateRange: DateRange | undefined;
    setCustomDateRange: (range: DateRange | undefined) => void;
}

export interface SalesAnalyticsViewProps {
    salesData: ChartData;
    topDishesData: ChartData;
    formatCurrency: (amount: number) => string;
    previousPeriodData?: ReportMetrics;
    dateRange: string;
    getPercentageChange: (current: number, previous: number) => number;
}

export interface InventoryUsageViewProps {
    inventoryUsageData: InventoryUsageData;
    onRefresh?: () => void;
}

export interface ExecutiveDashboardProps {
    salesData: {
        currentSales: number;
        previousSales: number;
        salesGrowth: number;
        profitMargin: number;
    };
    inventoryData: {
        lowStockCount: number;
        outOfStockCount: number;
        criticalItems: Array<{
            name: string;
            depletion: string;
            depleted: boolean;
            warning: boolean;
        }>;
    };
    topDishes: string[];
    formatCurrency: (value: number) => string;
}

export interface InventoryItem {
    name: string;
    stock: string;
    usage: string;
    depletion: string;
    depleted: boolean;
    warning?: boolean;
}

export interface MetricsData {
    totalSales: number;
    avgDailySales: number;
    totalOrders: number;
    avgOrderValue: number;
    grossProfit: number;
    profitMargin: number;
}