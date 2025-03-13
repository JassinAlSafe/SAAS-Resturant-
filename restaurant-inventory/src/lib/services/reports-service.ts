import { supabase } from "@/lib/supabase";
import { DateRange } from "react-day-picker";
import { format, eachDayOfInterval } from "date-fns";
import { ChartData } from "chart.js";

interface RecipeIngredient {
    quantity: number;
    ingredients: {
        id: string;
        name: string;
        unit: string;
        category: string;
        cost: number;
    };
    recipes: {
        id: string;
        name: string;
        price: number;
    };
}

interface SaleRecord {
    id: string;
    dish_id: string;
    quantity: number;
    date: string;
    total_amount: number;
}

interface IngredientUsage {
    name: string;
    unit: string;
    category: string;
    dishes: Map<string, {
        name: string;
        quantityPerDish: number;
    }>;
    dailyUsage: Map<string, number>;
}

interface Sale {
    quantity: number;
    total_amount: number;
    date: string;
    dish: {
        name: string;
    };
}

interface SaleWithRecipe {
    id: string;
    quantity: number;
    total_amount: number;
    date: string;
    recipes?: {
        id: string;
        name: string;
        recipe_ingredients?: Array<{
            quantity: number;
            ingredients?: {
                id: string;
                name: string;
                cost: number;
            };
        }>;
    };
}

export interface ReportMetrics {
    totalSales: number;
    avgDailySales: number;
    totalOrders: number;
    avgOrderValue: number;
    grossProfit: number;
    profitMargin: number;
}

export const reportsService = {
    async getSalesData(dateRange: DateRange): Promise<{
        chartData: ChartData<"bar">;
        metrics: ReportMetrics;
    }> {
        try {
            const { from, to } = dateRange;
            if (!from || !to) throw new Error("Invalid date range");

            console.log('Fetching sales data for range:', {
                from: format(from, 'yyyy-MM-dd'),
                to: format(to, 'yyyy-MM-dd')
            });

            // Get sales data with recipe ingredients and their costs
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select(`
                    id,
                    quantity,
                    total_amount,
                    date,
                    recipes!inner (
                        id,
                        name,
                        recipe_ingredients!inner (
                            quantity,
                            ingredients!inner (
                                id,
                                name,
                                cost
                            )
                        )
                    )
                `)
                .filter('date', 'gte', format(from, 'yyyy-MM-dd'))
                .filter('date', 'lte', format(to, 'yyyy-MM-dd'))
                .order('date', { ascending: true })
                .returns<SaleWithRecipe[]>();

            if (salesError) {
                console.error('Supabase error details:', salesError);
                throw new Error(`Failed to fetch sales data: ${JSON.stringify(salesError)}`);
            }

            if (!salesData) {
                console.log('No sales data found');
                return {
                    chartData: {
                        labels: [],
                        datasets: []
                    },
                    metrics: {
                        totalSales: 0,
                        avgDailySales: 0,
                        totalOrders: 0,
                        avgOrderValue: 0,
                        grossProfit: 0,
                        profitMargin: 0
                    }
                };
            }

            console.log('Found sales records:', salesData.length);

            // Get all days in the range
            const days = eachDayOfInterval({ start: from, end: to });
            const labels = days.map(day => format(day, 'MMM d'));

            // Initialize sales values for each day
            const salesByDay = new Map(days.map(day => [format(day, 'yyyy-MM-dd'), 0]));
            const costsByDay = new Map(days.map(day => [format(day, 'yyyy-MM-dd'), 0]));

            // Aggregate sales data and calculate actual costs by day
            salesData.forEach(sale => {
                const date = format(new Date(sale.date), 'yyyy-MM-dd');
                salesByDay.set(date, (salesByDay.get(date) || 0) + sale.total_amount);

                // Calculate actual costs based on ingredients
                const recipeCost = sale.recipes?.recipe_ingredients?.reduce((total: number, ri: { ingredients?: { cost: number }, quantity: number }) => {
                    const ingredientCost = ri.ingredients?.cost || 0;
                    return total + (ingredientCost * ri.quantity);
                }, 0) || 0;

                const totalCost = recipeCost * sale.quantity;
                costsByDay.set(date, (costsByDay.get(date) || 0) + totalCost);
            });

            // Calculate metrics
            const totalSales = Array.from(salesByDay.values()).reduce((sum, sale) => sum + sale, 0);
            const totalCosts = Array.from(costsByDay.values()).reduce((sum, cost) => sum + cost, 0);
            const totalOrders = salesData.length;

            console.log('Calculated metrics:', {
                totalSales,
                totalCosts,
                totalOrders
            });

            const metrics: ReportMetrics = {
                totalSales,
                avgDailySales: totalSales / days.length,
                totalOrders,
                avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
                grossProfit: totalSales - totalCosts,
                profitMargin: totalSales > 0 ? ((totalSales - totalCosts) / totalSales) * 100 : 0
            };

            // Create chart data
            const chartData: ChartData<"bar"> = {
                labels,
                datasets: [
                    {
                        label: 'Sales (SEK)',
                        data: Array.from(salesByDay.values()),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 2,
                    },
                    {
                        label: 'Costs (SEK)',
                        data: Array.from(costsByDay.values()),
                        backgroundColor: 'rgba(239, 68, 68, 0.5)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2,
                    }
                ]
            };

            return { chartData, metrics };
        } catch (error) {
            console.error('Error fetching sales data:', error);
            throw error;
        }
    },

    async getTopDishes(dateRange: DateRange): Promise<ChartData<"pie">> {
        try {
            const { from, to } = dateRange;
            if (!from || !to) throw new Error("Invalid date range");

            // Get sales with dish information
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('quantity, total_amount, dish:dish_id(name)')
                .gte('date', format(from, 'yyyy-MM-dd'))
                .lte('date', format(to, 'yyyy-MM-dd'))
                .returns<Sale[]>();

            if (salesError) throw salesError;

            // Aggregate sales by dish
            const dishSales = (salesData || []).reduce((acc: Record<string, { total: number; count: number }>, sale: Sale) => {
                const dishName = sale.dish?.name || 'Unknown Dish';
                if (!acc[dishName]) {
                    acc[dishName] = { total: 0, count: 0 };
                }
                acc[dishName].total += sale.total_amount;
                acc[dishName].count += sale.quantity;
                return acc;
            }, {});

            // Sort dishes by total sales and get top 5
            type DishSaleEntry = [string, { total: number; count: number }];
            const topDishes = Object.entries(dishSales)
                .sort(([, a], [, b]: DishSaleEntry) => b.total - a.total)
                .slice(0, 5);

            // Calculate percentages
            const totalSales = topDishes.reduce((sum, [, data]: DishSaleEntry) => sum + data.total, 0);
            const labels = topDishes.map(([name]: DishSaleEntry) => name);
            const data = topDishes.map(([, data]: DishSaleEntry) =>
                Math.round((data.total / totalSales) * 100)
            );

            return {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            };
        } catch (error) {
            console.error('Error fetching top dishes:', error);
            throw error;
        }
    },

    async getInventoryUsage(dateRange: DateRange): Promise<ChartData<"line">> {
        try {
            const { from, to } = dateRange;
            if (!from || !to) throw new Error("Invalid date range");

            console.log('Fetching inventory usage for range:', {
                from: format(from, 'yyyy-MM-dd'),
                to: format(to, 'yyyy-MM-dd')
            });

            // Get all days in the range
            const days = eachDayOfInterval({ start: from, end: to });
            const labels = days.map((day: Date) => format(day, 'MMM d'));

            // Get inventory usage data with explicit join
            const { data: usageData, error: usageError } = await supabase
                .from('recipe_ingredients')
                .select(`
                    quantity,
                    ingredients!inner (
                        id,
                        name,
                        unit,
                        category,
                        cost
                    ),
                    recipes!inner (
                        id,
                        name,
                        price
                    )
                `)
                .returns<RecipeIngredient[]>();

            if (usageError) {
                console.error('Supabase error:', usageError);
                throw new Error(`Failed to fetch inventory data: ${JSON.stringify(usageError)}`);
            }

            // Get sales data for the date range
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('*')
                .filter('date', 'gte', format(from, 'yyyy-MM-dd'))
                .filter('date', 'lte', format(to, 'yyyy-MM-dd'))
                .order('date', { ascending: true })
                .returns<SaleRecord[]>();

            if (salesError) {
                console.error('Supabase error:', salesError);
                throw new Error(`Failed to fetch sales data: ${JSON.stringify(salesError)}`);
            }

            if (!usageData || !salesData || usageData.length === 0) {
                console.log('No data found:', { usageData: !!usageData, salesData: !!salesData });
                return {
                    labels: [],
                    datasets: []
                };
            }

            // Create a map of all ingredients used in dishes
            const ingredientUsageMap = new Map<string, IngredientUsage>();
            usageData.forEach(record => {
                const { ingredients, recipes, quantity: recipeQuantity } = record;

                // Initialize ingredient in the map if not exists
                if (!ingredientUsageMap.has(ingredients.id)) {
                    ingredientUsageMap.set(ingredients.id, {
                        name: ingredients.name,
                        unit: ingredients.unit,
                        category: ingredients.category,
                        dishes: new Map(),
                        dailyUsage: new Map()
                    });
                }

                // Add dish relationship
                ingredientUsageMap.get(ingredients.id)!.dishes.set(recipes.id, {
                    name: recipes.name,
                    quantityPerDish: recipeQuantity
                });
            });

            // Process sales to calculate ingredient usage
            salesData.forEach(sale => {
                const date = format(new Date(sale.date), 'yyyy-MM-dd');

                // For each ingredient that's used in this dish
                ingredientUsageMap.forEach((ingredientData) => {
                    const dishInfo = ingredientData.dishes.get(sale.dish_id);
                    if (dishInfo) {
                        const quantityUsed = dishInfo.quantityPerDish * sale.quantity;

                        // Initialize or update daily usage
                        const currentUsage = ingredientData.dailyUsage.get(date) || 0;
                        ingredientData.dailyUsage.set(date, currentUsage + quantityUsed);
                    }
                });
            });

            // Calculate total usage for each ingredient
            const ingredientTotals = Array.from(ingredientUsageMap.values())
                .map(ingredient => ({
                    name: ingredient.name,
                    unit: ingredient.unit,
                    category: ingredient.category,
                    total: Array.from(ingredient.dailyUsage.values())
                        .reduce((sum, qty) => sum + qty, 0)
                }))
                .sort((a, b) => b.total - a.total);

            // Get top 3 most used ingredients
            const topIngredients = ingredientTotals.slice(0, 3);

            // Create datasets for the chart
            const datasets = topIngredients.map((ingredient, index) => {
                const ingredientData = Array.from(ingredientUsageMap.values())
                    .find(data => data.name === ingredient.name);

                const data = days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    return ingredientData?.dailyUsage.get(dateStr) || 0;
                });

                const colors = [
                    ['rgb(255, 99, 132)', 'rgba(255, 99, 132, 0.5)'],
                    ['rgb(54, 162, 235)', 'rgba(54, 162, 235, 0.5)'],
                    ['rgb(255, 206, 86)', 'rgba(255, 206, 86, 0.5)']
                ];

                return {
                    label: `${ingredient.name} (${ingredient.unit})`,
                    data,
                    borderColor: colors[index][0],
                    backgroundColor: colors[index][1],
                    tension: 0.3
                };
            });

            return {
                labels,
                datasets
            };
        } catch (error) {
            console.error('Error fetching inventory usage:', error);
            throw error;
        }
    }
}; 