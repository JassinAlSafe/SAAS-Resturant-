// Report Types
export type DateRangeType = "week" | "month" | "quarter" | "custom";
export type TabType = "sales" | "inventory";

// Date Range Type
export interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

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
        borderWidth: number;
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
}

export interface DateRangeSelectorProps {
    dateRange: DateRangeType;
    setDateRange: (range: DateRangeType) => void;
    customDateRange: DateRange;
    setCustomDateRange: (range: DateRange) => void;
}

export interface SalesAnalyticsViewProps {
    salesData: SalesData;
    topDishesData: TopDishesData;
    formatCurrency: (value: number) => string;
    previousPeriodData?: {
        totalSales: number;
        avgDailySales: number;
        totalOrders: number;
        avgOrderValue: number;
    };
}

export interface InventoryUsageViewProps {
    inventoryUsageData: InventoryUsageData;
} 