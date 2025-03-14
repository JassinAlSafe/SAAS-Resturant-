// Report Types
export type DateRangeType = "week" | "month" | "quarter" | "custom";
export type TabType = "sales" | "inventory" | "executive"; // Make sure all values match what's used in Tabs

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
    analytics: {
        periodComparison: {
            currentPeriod: {
                totalSales: number;
                totalOrders: number;
                averageOrderValue: number;
                topCategories: Array<{ name: string; sales: number }>;
            };
            previousPeriod: {
                totalSales: number;
                totalOrders: number;
                averageOrderValue: number;
                topCategories: Array<{ name: string; sales: number }>;
            };
            growth: {
                sales: number;
                orders: number;
                averageOrder: number;
            };
        };
        peakHours: Array<{
            hour: number;
            sales: number;
            orders: number;
        }>;
        staffPerformance?: Array<{
            userId: string;
            name: string;
            totalSales: number;
            orderCount: number;
            averageOrderValue: number;
        }>;
    };
}

export interface DishAnalytics {
    id: string;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    profit: number;
    profitMargin: number;
    ingredients: Array<{
        id: string;
        name: string;
        quantityUsed: number;
        cost: number;
        inStock: boolean;
    }>;
    trends: {
        daily: Array<{ date: string; quantity: number; revenue: number }>;
        weekly: Array<{ week: string; quantity: number; revenue: number }>;
        monthly: Array<{ month: string; quantity: number; revenue: number }>;
    };
    dietary?: {
        isVegetarian: boolean;
        isVegan: boolean;
        isGlutenFree: boolean;
        allergens: string[];
    };
}

export interface TopDishesData extends ChartData {
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
        borderWidth: number;
    }>;
    dishAnalytics: DishAnalytics[];
}

export interface InventoryDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
}

export interface InventoryItemDetail {
    id: string;
    name: string;
    currentStock: number;
    unit: string;
    costPerUnit: number;
    reorderLevel: number;
    usage: number;
    daysUntilDepletion: number;
    totalCost: number;
    category: string;
}

export interface InventoryUsageData {
    labels: string[];
    datasets: InventoryDataset[];
    inventory: InventoryItemDetail[];
    analytics: {
        totalCost: number;
        averageDailyUsage: Record<string, number>;
        profitableIngredients: Array<{
            id: string;
            name: string;
            usage: number;
            costPerUnit: number;
            efficiency: number;
        }>;
        criticalItems: Array<{
            id: string;
            name: string;
            depletion: string;
            depleted: boolean;
            warning: boolean;
            currentStock?: number;
            reorderLevel?: number;
        }>;
    };
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
    salesData: SalesData;
    topDishesData: TopDishesData;
    formatCurrency: (value: number) => string;
    previousPeriodData?: {
        totalSales: number;
        avgDailySales: number;
        totalOrders: number;
        avgOrderValue: number;
    };
    getPercentageChange: (current: number, previous: number) => number;
    dateRange: DateRange | undefined; // Make it required, not optional
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
        projectedSales: number;
        revenueByCategory: Array<{
            category: string;
            revenue: number;
            growth: number;
        }>;
    };
    inventoryData: {
        lowStockCount: number;
        outOfStockCount: number;
        totalInventoryValue: number;
        inventoryTurnover: number;
        criticalItems: Array<{
            name: string;
            depletion: string;
            depleted: boolean;
            warning: boolean;
            action: string;
        }>;
        upcomingOrders: Array<{
            supplier: string;
            items: number;
            value: number;
            expectedDate: string;
        }>;
    };
    operationalInsights: {
        peakHours: Array<{ hour: number; sales: number }>;
        staffUtilization: number;
        averageOrderPrepTime: number;
        customerSatisfaction?: number;
        wastageMetrics?: {
            cost: number;
            percentage: number;
            topWastedItems: Array<{ name: string; quantity: number; cost: number }>;
        };
    };
    seasonalTrends: {
        topDishes: string[];
        emergingItems: Array<{ name: string; growth: number }>;
        seasonalPerformance: Array<{
            season: string;
            revenue: number;
            topDishes: string[];
        }>;
    };
    formatCurrency: (value: number) => string;
}

export interface MetricsData {
    totalSales: number;
    avgDailySales: number;
    totalOrders: number;
    avgOrderValue: number;
    grossProfit: number;
    profitMargin: number;
}

// Export service types
export * from './service-types';