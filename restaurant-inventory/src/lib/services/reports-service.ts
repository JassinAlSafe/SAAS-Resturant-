import { supabase } from "@/lib/supabase";
import { DateRange } from "react-day-picker";
import { format, eachDayOfInterval, parseISO } from "date-fns";
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

import { inventoryService } from './inventory-service';
import { salesService } from './sales-service';
import { subDays } from 'date-fns';

interface SalesDataResponse {
    chartData: ChartData<'bar'>;
    metrics: ReportMetrics;
}

interface TopDishInfo {
    dishId: string;
    dishName: string;
    quantity: number;
    revenue: number;
    cost: number;
    profit: number;
    ingredients: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
    }[];
}

type DishIngredient = {
    dish_id: string;
    ingredient_id: string;
    quantity: number;
};

type InventoryUsageReport = {
    labels: string[];
    datasets: InventoryUsageDataset[];
    inventory: InventoryStatus[];
};

type InventoryUsageDataset = {
    name: string;
    data: number[];
};

type InventoryStatus = {
    name: string;
    stock: string;
    usage: string;
    depletion: string;
    depleted: boolean;
    warning: boolean;
};

type DishDetails = {
    id: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    revenue: number;
    profit: number;
    ingredients: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
    }[];
};

export const reportsService = {
    /**
     * Get sales data for the selected date range
     */
    async getSalesData(dateRange: DateRange): Promise<SalesDataResponse> {
        if (!dateRange.from || !dateRange.to) {
            throw new Error("Invalid date range");
        }

        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");

        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            // Get the user\'s business profile
            const { data: businessProfile, error: businessError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !businessProfile) {
                console.error('Error fetching business profile:', businessError);
                throw new Error('Business profile not found');
            }

            // Fetch sales data from the database
            const { data: salesData, error } = await supabase
                .from('sales')
                .select('*, recipes:dish_id(name, price, food_cost)')
                .eq('business_profile_id', businessProfile.id)
                .gte('date', fromDate)
                .lte('date', toDate)
                .order('date', { ascending: true });

            if (error) throw error;

            // Generate all dates in the range for consistent charting
            const allDates = eachDayOfInterval({
                start: dateRange.from,
                end: dateRange.to
            });

            // Group sales by date
            const salesByDate: Record<string, { total: number, orders: number }> = {};

            // Initialize each date with zero values
            allDates.forEach(date => {
                const dateStr = format(date, "yyyy-MM-dd");
                salesByDate[dateStr] = { total: 0, orders: 0 };
            });

            // Aggregate actual sales data
            salesData?.forEach(sale => {
                const dateStr = typeof sale.date === 'string' ? sale.date : format(sale.date, "yyyy-MM-dd");
                if (!salesByDate[dateStr]) {
                    salesByDate[dateStr] = { total: 0, orders: 0 };
                }
                salesByDate[dateStr].total += sale.total_amount || 0;
                salesByDate[dateStr].orders += 1;
            });

            // Extract totals for metrics calculation
            const totalSales = Object.values(salesByDate).reduce((sum, day) => sum + day.total, 0);
            const totalOrders = Object.values(salesByDate).reduce((sum, day) => sum + day.orders, 0);
            const avgDailySales = totalSales / allDates.length;
            const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

            // Calculate profit if food cost data is available
            let grossProfit = 0;
            let totalCost = 0;
            salesData?.forEach(sale => {
                const foodCost = sale.recipes?.food_cost || 0;
                totalCost += foodCost * (sale.quantity || 1);
                grossProfit += (sale.total_amount || 0) - (foodCost * (sale.quantity || 1));
            });
            const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

            // Format the chart data
            const chartData: ChartData<'bar'> = {
                labels: allDates.map(date => format(date, "MMM d")),
                datasets: [
                    {
                        label: 'Sales',
                        data: allDates.map(date => salesByDate[format(date, "yyyy-MM-dd")].total),
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        borderColor: 'rgba(53, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            };

            return {
                chartData,
                metrics: {
                    totalSales,
                    avgDailySales,
                    totalOrders,
                    avgOrderValue,
                    grossProfit,
                    profitMargin
                }
            };
        } catch (error) {
            console.error('Error fetching sales data:', error);
            throw error;
        }
    },

    /**
     * Get top selling dishes data for the selected date range
     */
    async getTopDishes(dateRange: DateRange): Promise<ChartData<'pie'>> {
        if (!dateRange.from || !dateRange.to) {
            throw new Error("Invalid date range");
        }

        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");

        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            // Get the user\'s business profile
            const { data: businessProfile, error: businessError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !businessProfile) {
                console.error('Error fetching business profile:', businessError);
                throw new Error('Business profile not found');
            }

            // Modified query to work with actual database schema
            // Fetch sales data from the database grouped by dish
            const { data: salesData, error } = await supabase
                .from('sales')
                .select('dish_id, quantity, total_amount, recipes:dish_id(name)')
                .eq('business_profile_id', businessProfile.id)
                .gte('date', fromDate)
                .lte('date', toDate);

            if (error) throw error;

            // Group sales by dish
            const dishSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
            salesData?.forEach(sale => {
                const dishId = sale.dish_id;
                if (!dishSales[dishId]) {
                    // Use the recipe name from the joined table instead of dish_name
                    dishSales[dishId] = {
                        name: sale.recipes?.name || 'Unknown',
                        quantity: 0,
                        revenue: 0
                    };
                }
                dishSales[dishId].quantity += sale.quantity || 0;
                dishSales[dishId].revenue += sale.total_amount || 0;
            });

            // Rest of the function remains the same
            // Sort and take top 5 dishes by revenue
            const topDishes = Object.values(dishSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // If we have fewer than 5 dishes, add an "Other" category
            const otherDishes = Object.values(dishSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(5);

            // Calculate total revenue for percentage
            const totalRevenue = Object.values(dishSales).reduce((sum, dish) => sum + dish.revenue, 0);

            // Prepare chart data
            const chartData: ChartData<'pie'> = {
                labels: [...topDishes.map(dish => dish.name), otherDishes.length > 0 ? 'Other' : null].filter(Boolean) as string[],
                datasets: [
                    {
                        data: [
                            ...topDishes.map(dish => Math.round((dish.revenue / totalRevenue) * 100)),
                            otherDishes.length > 0 ? Math.round((otherDishes.reduce((sum, dish) => sum + dish.revenue, 0) / totalRevenue) * 100) : null
                        ].filter(Boolean) as number[],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',  // Red
                            'rgba(54, 162, 235, 0.7)',  // Blue
                            'rgba(255, 206, 86, 0.7)',  // Yellow
                            'rgba(75, 192, 192, 0.7)',  // Green
                            'rgba(153, 102, 255, 0.7)', // Purple
                            'rgba(128, 128, 128, 0.7)', // Gray for "Other"
                        ],
                        borderWidth: 1
                    }
                ]
            };

            return chartData;
        } catch (error) {
            console.error('Error fetching top dishes data:', error);
            throw error;
        }
    },

    /**
     * Get detailed information about a specific dish
     */
    async getDishDetails(dishId: string): Promise<DishDetails> {
        try {
            // Get the dish details
            const { data: dish, error: dishError } = await supabase
                .from('dishes')
                .select('id, name, description, price, cost')
                .eq('id', dishId)
                .single();

            if (dishError || !dish) {
                console.error('Error fetching dish:', dishError);
                throw new Error('Dish not found');
            }

            // Get sales for this dish
            const { data: sales, error: salesError } = await supabase
                .from('sales')
                .select('quantity')
                .eq('dish_id', dishId);

            if (salesError) throw salesError;

            // Get recipe ingredients
            const { data: dishIngredients, error: ingredientsError } = await supabase
                .from('dish_ingredients')
                .select('dish_id, ingredient_id, quantity')
                .eq('dish_id', dishId);

            if (ingredientsError) throw ingredientsError;

            // Calculate total revenue and cost
            const totalQuantity = sales?.reduce((sum, sale) => sum + (sale.quantity || 0), 0) || 0;
            const totalRevenue = totalQuantity * dish.price;
            const totalCost = totalQuantity * (dish.cost || 0);
            const profit = totalRevenue - totalCost;

            // Create a function to get ingredient details
            const getIngredientDetails = async (ingredientId: string) => {
                const item = await inventoryService.getItem(ingredientId);
                return {
                    name: item?.name || 'Unknown',
                    unit: item?.unit || ''
                };
            };

            // Map ingredients with details
            const ingredientsWithDetails = await Promise.all((dishIngredients || []).map(async (item) => {
                const details = await getIngredientDetails(item.ingredient_id);
                return {
                    id: item.ingredient_id || '',
                    name: details.name,
                    quantity: item.quantity || 0,
                    unit: details.unit
                };
            }));

            return {
                id: dish.id,
                name: dish.name,
                description: dish.description || '',
                price: dish.price,
                cost: dish.cost || 0,
                revenue: totalRevenue,
                profit: profit,
                ingredients: ingredientsWithDetails
            };
        } catch (error) {
            console.error('Error getting dish details:', error);
            throw error;
        }
    },

    /**
     * Get inventory usage data based on sales and recipes
     */
    async getInventoryUsageData(dateRange: DateRange): Promise<InventoryUsageReport> {
        if (!dateRange.from || !dateRange.to) {
            throw new Error("Invalid date range");
        }

        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");

        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            // Get the user\'s business profile
            const { data: businessProfile, error: businessError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !businessProfile) {
                console.error('Error fetching business profile:', businessError);
                throw new Error('Business profile not found');
            }

            // Fetch current inventory items
            const inventoryItems = await inventoryService.getItems();

            // Fetch sales in date range
            const { data: sales, error: salesError } = await supabase
                .from('sales')
                .select('id, dish_id, quantity, date')
                .eq('business_profile_id', businessProfile.id)
                .gte('date', fromDate)
                .lte('date', toDate);

            if (salesError) throw salesError;

            // Get recipe ingredients - without business_profile_id filter
            const { data: dishIngredients, error: ingredientsError } = await supabase
                .from('dish_ingredients')
                .select('dish_id, ingredient_id, quantity');

            if (ingredientsError) throw ingredientsError;

            // Generate all dates in the range
            const allDates = eachDayOfInterval({
                start: dateRange.from,
                end: dateRange.to
            });
            const dateLabels = allDates.map(date => format(date, "MMM d"));

            // Create a mapping of ingredients to track usage
            const ingredientUsage: Record<string, {
                name: string;
                usage: number[];
                totalUsage: number;
                currentStock: number;
                unit: string;
                minimumLevel?: number
            }> = {};

            // Initialize ingredient usage tracking
            inventoryItems.forEach(item => {
                ingredientUsage[item.id] = {
                    name: item.name,
                    usage: Array(allDates.length).fill(0),
                    totalUsage: 0,
                    currentStock: item.quantity,
                    unit: item.unit,
                    minimumLevel: item.reorder_level // Use reorder_level instead of minimum_stock_level
                };
            });

            // Calculate ingredient usage from sales
            sales?.forEach(sale => {
                const dateIndex = allDates.findIndex(date =>
                    format(date, "yyyy-MM-dd") === (typeof sale.date === 'string' ? sale.date : format(sale.date, "yyyy-MM-dd"))
                );

                if (dateIndex === -1) return;

                const relevantIngredients = dishIngredients?.filter(di => di.dish_id === sale.dish_id) || [];
                
                relevantIngredients.forEach(ingredient => {
                    const ingredientId = ingredient.ingredient_id;
                    if (ingredientId && ingredientUsage[ingredientId]) {
                        const usage = (ingredient.quantity || 0) * (sale.quantity || 0);
                        ingredientUsage[ingredientId].usage[dateIndex] += usage;
                        ingredientUsage[ingredientId].totalUsage += usage;
                    }
                });
            });

            // Prepare datasets for chart
            const datasets: InventoryUsageDataset[] = Object.values(ingredientUsage)
                .filter(data => data.totalUsage > 0)
                .slice(0, 5) // Top 5 ingredients by usage
                .map(data => ({
                    name: data.name,
                    data: data.usage
                }));

            // Prepare inventory status data
            const inventory: InventoryStatus[] = Object.values(ingredientUsage)
                .filter(data => data.totalUsage > 0)
                .sort((a, b) => b.totalUsage - a.totalUsage)
                .map(data => {
                    // Calculate average daily usage
                    const avgDailyUsage = data.totalUsage / allDates.length;

                    // Calculate days until depletion
                    const daysUntilDepletion = avgDailyUsage > 0
                        ? Math.round(data.currentStock / avgDailyUsage)
                        : Infinity;

                    // Determine status
                    const depleted = daysUntilDepletion <= 2;
                    const warning = daysUntilDepletion <= 7 && daysUntilDepletion > 2;
                    const belowMinimum = data.minimumLevel !== undefined && data.currentStock < data.minimumLevel;

                    return {
                        name: data.name,
                        stock: `${data.currentStock} ${data.unit}`,
                        usage: `${data.totalUsage.toFixed(1)} ${data.unit}`,
                        depletion: daysUntilDepletion === Infinity ? 'N/A' : `${daysUntilDepletion} days`,
                        depleted: depleted || belowMinimum,
                        warning: warning
                    };
                });

            return {
                labels: dateLabels,
                datasets,
                inventory
            };
        } catch (error) {
            console.error('Error generating inventory usage data:', error);
            throw error;
        }
    },

    /**
     * Get executive dashboard summary data
     */
    async getDashboardSummary() {
        try {
            // Get today\'s date and previous periods
            const today = new Date();
            const lastWeek = {
                from: subDays(today, 7),
                to: today
            };
            const previousWeek = {
                from: subDays(today, 14),
                to: subDays(today, 8)
            };

            // Get sales data for current and previous periods
            const currentSales = await this.getSalesData(lastWeek);
            const previousSales = await this.getSalesData(previousWeek);

            // Get inventory status
            const inventoryItems = await inventoryService.getItems();
            const lowStockItems = inventoryItems.filter(item => {
                const minimumLevel = item.minimum_stock_level || item.reorder_level || 5;
                return item.quantity <= minimumLevel && item.quantity > 0;
            });
            const outOfStockItems = inventoryItems.filter(item => item.quantity === 0);

            // Provide fallback data if inventory usage fails
            let inventoryUsage;
            let criticalItems = [];

            try {
                // Get inventory usage data for forecasting
                inventoryUsage = await this.getInventoryUsageData(lastWeek);

                // Identify critical items (projected to deplete within 3 days)
                if (inventoryUsage && inventoryUsage.inventory) {
                    criticalItems = inventoryUsage.inventory
                        .filter(item => {
                            const daysUntilDepletion = item.depletion === 'N/A'
                                ? Infinity
                                : parseInt(item.depletion.split(' ')[0]);
                            return daysUntilDepletion <= 3 && daysUntilDepletion !== Infinity;
                        })
                        .slice(0, 5); // Top 5 most critical
                }
            } catch (error) {
                console.warn('Error fetching inventory usage data, using fallback:', error);
                criticalItems = lowStockItems.slice(0, 5).map(item => ({
                    name: item.name,
                    depletion: "Soon",
                    depleted: true,
                    warning: true
                }));
            }

            // Get top selling dishes with error handling
            let topDishes = { labels: [] };
            try {
                topDishes = await this.getTopDishes(lastWeek);
            } catch (error) {
                console.warn('Error fetching top dishes data, using fallback:', error);
                topDishes = { labels: [] };
            }

            // Calculate key metrics
            const salesGrowth = previousSales.metrics.totalSales > 0
                ? ((currentSales.metrics.totalSales - previousSales.metrics.totalSales) / previousSales.metrics.totalSales) * 100
                : 0;

            return {
                currentSales: currentSales.metrics.totalSales,
                previousSales: previousSales.metrics.totalSales,
                salesGrowth,
                profitMargin: currentSales.metrics.profitMargin,
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStockItems.length,
                criticalItems,
                topDishes: topDishes.labels.slice(0, 3),
                recentActivity: [], // To be implemented with actual activity logs
            };
        } catch (error) {
            console.error('Error generating dashboard summary:', error);
            throw error;
        }
    }
};