import { ChartData } from "chart.js";
// DateRange is used in function signatures, so we need to keep it
// import { DateRange } from "react-day-picker";

// Sales Analytics Service Types
export interface SalesDataResponse {
    chartData: ChartData<'bar'>;
    metrics: {
        totalSales: number;
        avgDailySales: number;
        totalOrders: number;
        avgOrderValue: number;
        grossProfit: number;
        profitMargin: number;
    };
    topDishes: Array<{
        name: string;
        revenue: number;
    }>;
    // Optional staff performance data
    staffPerformance?: Array<{
        userId: string;
        name: string;
        totalSales: number;
        orderCount: number;
        averageOrderValue: number;
    }>;
}

export interface DishPerformanceMetrics {
    dishDetails: {
        id: string;
        name: string;
        price: number;
        ingredients: Array<{
            name: string;
            quantity: number;
            unit: string;
            cost: number;
            category: string;
        }>;
        dietary: {
            vegetarian: boolean;
            vegan: boolean;
            glutenFree: boolean;
            dairyFree: boolean;
        };
    };
    salesMetrics: {
        totalQuantity: number;
        totalRevenue: number;
        totalCost: number;
        profit: number;
        profitMargin: number;
        costPercentage: number;
        ingredientCostPerUnit: number;
    };
    chartData: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            backgroundColor: string;
        }>;
    };
}

// Inventory Analytics Service Types
export interface InventoryUsageData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth?: number;
        tension: number;
    }>;
    inventory: Array<{
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
    }>;
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

// Executive Dashboard Service Types
export interface ExecutiveSummaryResponse {
    sales: {
        current: number;
        previous: number;
        growth: number;
        profitMargin: number;
    };
    inventory: {
        lowStockCount: number;
        outOfStockCount: number;
        criticalItems: Array<{
            name: string;
            depletion: string;
            depleted: boolean;
            warning: boolean;
        }>;
        totalValue: number;
    };
    profitability: {
        topProfitableItems: Array<{
            name: string;
            efficiency: number;
        }>;
    };
    operations: {
        totalOrders: number;
        avgOrderValue: number;
    };
} 