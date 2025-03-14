import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { salesAnalyticsService } from "./sales-analytics.service";
import { inventoryAnalyticsService } from "./inventory-analytics.service";
import { supabase } from '@/lib/supabase';
import type { ExecutiveSummaryResponse } from '@/app/(protected)/reports/types/service-types';
import { format } from "date-fns";

export const executiveDashboardService = {
    /**
     * Get executive summary of sales and inventory data
     */
    async getExecutiveSummary(dateRange: DateRange): Promise<ExecutiveSummaryResponse> {
        try {
            console.log('Starting executive summary fetch with date range:', dateRange);

            if (!dateRange.from || !dateRange.to) {
                throw new Error('Invalid date range provided');
            }

            // Format dates for Supabase query
            const fromDate = format(dateRange.from, 'yyyy-MM-dd');
            const toDate = format(dateRange.to, 'yyyy-MM-dd');

            console.log(`Formatted date range: ${fromDate} to ${toDate}`);

            // Calculate previous period date range (same duration, immediately before current period)
            const daysDifference = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
            const previousPeriodFrom = subDays(dateRange.from, daysDifference);
            const previousPeriodTo = subDays(dateRange.from, 1);

            const previousPeriodRange = {
                from: previousPeriodFrom,
                to: previousPeriodTo
            };

            console.log('Previous period range:', {
                from: format(previousPeriodFrom, 'yyyy-MM-dd'),
                to: format(previousPeriodTo, 'yyyy-MM-dd')
            });

            // Fetch current and previous period sales data in parallel
            console.log('Fetching current and previous period sales data...');
            const [currentSalesData, previousSalesData] = await Promise.all([
                salesAnalyticsService.getSalesData(dateRange).catch(err => {
                    console.error('Error fetching current period sales data:', err);
                    return {
                        metrics: {
                            totalSales: 0,
                            avgDailySales: 0,
                            totalOrders: 0,
                            avgOrderValue: 0,
                            grossProfit: 0,
                            profitMargin: 0
                        },
                        chartData: { labels: [], datasets: [] },
                        topDishes: []
                    };
                }),
                salesAnalyticsService.getSalesData(previousPeriodRange).catch(err => {
                    console.error('Error fetching previous period sales data:', err);
                    return {
                        metrics: {
                            totalSales: 0,
                            avgDailySales: 0,
                            totalOrders: 0,
                            avgOrderValue: 0,
                            grossProfit: 0,
                            profitMargin: 0
                        },
                        chartData: { labels: [], datasets: [] },
                        topDishes: []
                    };
                })
            ]);

            console.log('Sales data fetched successfully');

            // Fetch inventory items and inventory usage data
            console.log('Fetching inventory data...');
            const { data: inventoryItems, error: inventoryError } = await supabase
                .from('ingredients')
                .select('id, name, quantity, reorder_level, cost')
                .order('name');

            if (inventoryError) {
                console.error('Error fetching inventory items:', inventoryError);
                throw new Error(`Failed to fetch inventory items: ${inventoryError.message}`);
            }

            console.log(`Fetched ${inventoryItems?.length || 0} inventory items`);

            // Fetch inventory usage data
            let inventoryUsageData;
            try {
                console.log('Fetching inventory usage data...');
                inventoryUsageData = await inventoryAnalyticsService.getInventoryUsageData(dateRange);
                console.log('Inventory usage data fetched successfully');
            } catch (err) {
                console.error('Error fetching inventory usage data:', err);
                inventoryUsageData = {
                    labels: [],
                    datasets: [],
                    inventory: [],
                    analytics: {
                        totalCost: 0,
                        averageDailyUsage: {},
                        profitableIngredients: [],
                        criticalItems: []
                    }
                };
            }

            // Calculate sales growth
            const currentSales = currentSalesData.metrics.totalSales;
            const previousSales = previousSalesData.metrics.totalSales;
            const salesGrowth = previousSales > 0
                ? ((currentSales - previousSales) / previousSales) * 100
                : 0;

            console.log('Sales metrics calculated:', {
                currentSales,
                previousSales,
                salesGrowth
            });

            // Calculate inventory metrics
            const lowStockItems = inventoryItems?.filter(item =>
                item.quantity <= item.reorder_level && item.quantity > 0
            ) || [];

            const outOfStockItems = inventoryItems?.filter(item =>
                item.quantity === 0
            ) || [];

            const totalInventoryValue = inventoryItems?.reduce(
                (sum, item) => sum + (item.quantity * item.cost), 0
            ) || 0;

            console.log('Inventory metrics calculated:', {
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStockItems.length,
                totalInventoryValue
            });

            // Get critical items from inventory usage data
            const criticalItems = inventoryUsageData.analytics.criticalItems.map((item: {
                name: string;
                depletion: string;
                depleted: boolean;
                warning?: boolean;
            }) => ({
                name: item.name,
                depletion: item.depletion,
                depleted: item.depleted,
                warning: item.warning || false
            }));

            // Get top profitable items
            const topProfitableItems = inventoryUsageData.analytics.profitableIngredients.map((item: {
                name: string;
                efficiency: number;
            }) => ({
                name: item.name,
                efficiency: item.efficiency || 0
            }));

            // Prepare the executive summary response
            console.log('Executive summary preparation complete');

            return {
                sales: {
                    current: currentSales,
                    previous: previousSales,
                    growth: salesGrowth,
                    profitMargin: currentSalesData.metrics.profitMargin
                },
                inventory: {
                    totalValue: totalInventoryValue,
                    lowStockCount: lowStockItems.length,
                    outOfStockCount: outOfStockItems.length,
                    criticalItems
                },
                profitability: {
                    topProfitableItems
                },
                operations: {
                    totalOrders: currentSalesData.metrics.totalOrders,
                    avgOrderValue: currentSalesData.metrics.avgOrderValue
                }
            };
        } catch (error) {
            console.error('Error generating executive summary:', error);
            // Return minimal valid response on error
            return {
                sales: {
                    current: 0,
                    previous: 0,
                    growth: 0,
                    profitMargin: 0
                },
                inventory: {
                    totalValue: 0,
                    lowStockCount: 0,
                    outOfStockCount: 0,
                    criticalItems: []
                },
                profitability: {
                    topProfitableItems: []
                },
                operations: {
                    totalOrders: 0,
                    avgOrderValue: 0
                }
            };
        }
    }
}; 