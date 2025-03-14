import { supabase } from '@/lib/supabase';
import { DateRange } from "react-day-picker";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { ChartData } from "chart.js";
import type { SalesDataResponse, DishPerformanceMetrics } from '@/app/(protected)/reports/types/service-types';

// Define types for recipe ingredients
interface Ingredient {
    id: string;
    name: string;
    cost: number;
    quantity?: number;
    unit?: string;
    category?: string;
}

interface RecipeIngredient {
    quantity: number;
    ingredients: Ingredient;
}

interface Recipe {
    name: string;
    price: number;
    food_cost: number;
    recipe_ingredients: RecipeIngredient[];
}

interface Sale {
    id: string;
    dish_id: string;
    quantity: number;
    date: string | Date;
    total_amount: number;
    user_id: string;
    recipes?: Recipe;
}

interface DishIngredient {
    name: string;
    quantity: number;
    unit: string;
    cost: number;
    category: string;
}

export const salesAnalyticsService = {
    /**
     * Get sales data for the selected date range with enhanced metrics
     */
    async getSalesData(dateRange: DateRange): Promise<SalesDataResponse> {
        try {
            console.log('Starting sales data fetch with date range:', dateRange);

            if (!dateRange.from || !dateRange.to) {
                throw new Error('Invalid date range provided');
            }

            // Format dates for Supabase query
            const fromDate = format(dateRange.from, 'yyyy-MM-dd');
            const toDate = format(dateRange.to, 'yyyy-MM-dd');

            console.log(`Formatted date range: ${fromDate} to ${toDate}`);

            // Fetch sales data with recipe information
            console.log('Fetching sales data with recipe information...');
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select(`
                    *,
                    recipes:dish_id(
                        name, 
                        price, 
                        food_cost,
                        recipe_ingredients(
                            quantity,
                            ingredients(id, name, cost)
                        )
                    )
                `)
                .gte('date', fromDate)
                .lte('date', toDate)
                .order('date', { ascending: true });

            if (salesError) {
                console.error('Error fetching sales data:', salesError);
                throw new Error(`Failed to fetch sales data: ${salesError.message}`);
            }

            console.log(`Fetched ${salesData?.length || 0} sales records`);

            // If no sales data, return empty response
            if (!salesData || salesData.length === 0) {
                console.log('No sales data found for the specified period');
                return {
                    chartData: {
                        labels: [],
                        datasets: [{
                            label: 'Daily Sales',
                            data: [],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        }]
                    },
                    topDishes: [],
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

            // Generate all dates in the range for consistent charting
            const allDates = eachDayOfInterval({
                start: dateRange.from,
                end: dateRange.to
            });

            // Initialize sales tracking
            const salesByDate: Record<string, { total: number; orders: number }> = {};
            const salesByStaff: Record<string, { total: number; orders: number; name: string }> = {};
            let totalCost = 0;
            let totalRevenue = 0;

            // Initialize dates with zero values
            allDates.forEach(date => {
                const dateStr = format(date, "yyyy-MM-dd");
                salesByDate[dateStr] = { total: 0, orders: 0 };
            });

            // Process sales data
            (salesData as Sale[] || []).forEach(sale => {
                const dateStr = typeof sale.date === 'string' ? sale.date : format(sale.date, "yyyy-MM-dd");
                const staffId = sale.user_id;
                // Use a default name since we can't join with users table
                const staffName = 'Staff #' + staffId;
                const foodCost = sale.recipes?.food_cost || 0;
                const quantity = sale.quantity || 0;
                const revenue = sale.total_amount || 0;

                // Update metrics
                if (!salesByDate[dateStr]) {
                    salesByDate[dateStr] = { total: 0, orders: 0 };
                }
                salesByDate[dateStr].total += revenue;
                salesByDate[dateStr].orders += 1;

                if (!salesByStaff[staffId]) {
                    salesByStaff[staffId] = { total: 0, orders: 0, name: staffName };
                }
                salesByStaff[staffId].total += revenue;
                salesByStaff[staffId].orders += 1;

                totalCost += foodCost * quantity;
                totalRevenue += revenue;
            });

            // Calculate metrics
            const totalOrders = Object.values(salesByDate).reduce((sum, day) => sum + day.orders, 0);
            const avgDailySales = totalRevenue / allDates.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            const grossProfit = totalRevenue - totalCost;
            const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

            // Format chart data
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

            // Prepare top dishes data
            const dishSales: Record<string, { name: string, revenue: number, quantity: number }> = {};

            (salesData as Sale[] || []).forEach(sale => {
                const dishId = sale.dish_id;
                const dishName = sale.recipes?.name || `Dish #${dishId}`;
                const revenue = sale.total_amount || 0;
                const quantity = sale.quantity || 0;

                if (!dishSales[dishId]) {
                    dishSales[dishId] = { name: dishName, revenue: 0, quantity: 0 };
                }

                dishSales[dishId].revenue += revenue;
                dishSales[dishId].quantity += quantity;
            });

            const topDishes = Object.values(dishSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map(dish => ({
                    name: dish.name,
                    revenue: dish.revenue
                }));

            return {
                chartData,
                metrics: {
                    totalSales: totalRevenue,
                    avgDailySales,
                    totalOrders,
                    avgOrderValue,
                    grossProfit,
                    profitMargin
                },
                staffPerformance: Object.entries(salesByStaff).map(([id, data]) => ({
                    userId: id,
                    name: data.name,
                    totalSales: data.total,
                    orderCount: data.orders,
                    averageOrderValue: data.total / data.orders
                })),
                topDishes
            };
        } catch (error) {
            console.error('Error processing sales data:', error);
            // Return empty data structure on error
            return {
                chartData: {
                    labels: [],
                    datasets: [{
                        label: 'Daily Sales',
                        data: [],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    }]
                },
                topDishes: [],
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
    },

    /**
     * Get detailed dish performance metrics including profitability and ingredient usage
     */
    async getDishPerformance(dishId: string, dateRange: DateRange): Promise<DishPerformanceMetrics> {
        try {
            console.log(`Fetching performance data for dish ${dishId}`);

            if (!dateRange.from || !dateRange.to) {
                throw new Error('Invalid date range provided');
            }

            // Format dates for Supabase query
            const fromDate = format(dateRange.from, 'yyyy-MM-dd');
            const toDate = format(dateRange.to, 'yyyy-MM-dd');

            // Fetch dish details with recipe ingredients
            const { data: dishData, error: dishError } = await supabase
                .from('dishes')
                .select(`
                    id, 
                    name,
                    price,
                    dish_ingredients(
                        quantity,
                        ingredients(
                            id,
                            name,
                            cost,
                            quantity,
                            unit,
                            category
                        )
                    )
                `)
                .eq('id', dishId)
                .single();

            if (dishError) {
                console.error('Error fetching dish details:', dishError);
                throw new Error(`Failed to fetch dish details: ${dishError.message}`);
            }

            // Fetch sales data for this dish
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('quantity, total_amount, date')
                .eq('dish_id', dishId)
                .gte('date', fromDate)
                .lte('date', toDate)
                .order('date');

            if (salesError) {
                console.error('Error fetching dish sales:', salesError);
                throw new Error(`Failed to fetch dish sales: ${salesError.message}`);
            }

            // Calculate metrics
            const totalQuantity = salesData?.reduce((sum, sale) => sum + (sale.quantity || 0), 0) || 0;
            const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

            // Calculate ingredient costs and usage
            const ingredients: DishIngredient[] = [];
            let totalIngredientCost = 0;

            if (dishData.dish_ingredients) {
                for (const item of dishData.dish_ingredients) {
                    if (item.ingredients) {
                        // The ingredients property might be an array or a single object
                        // We need to handle both cases
                        const ingredient = Array.isArray(item.ingredients)
                            ? item.ingredients[0]
                            : item.ingredients;

                        if (ingredient) {
                            const cost = (ingredient.cost || 0) * item.quantity;
                            totalIngredientCost += cost;

                            ingredients.push({
                                name: ingredient.name || 'Unknown',
                                quantity: item.quantity || 0,
                                unit: ingredient.unit || '',
                                cost,
                                category: ingredient.category || 'Other'
                            });
                        }
                    }
                }
            }

            const totalCost = totalIngredientCost * totalQuantity;
            const profit = totalRevenue - totalCost;
            const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
            const costPercentage = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;

            // Group sales by date for chart
            const salesByDate = new Map<string, number>();

            salesData?.forEach(sale => {
                const saleDate = format(parseISO(sale.date), 'MMM dd');
                const currentSales = salesByDate.get(saleDate) || 0;
                salesByDate.set(saleDate, currentSales + (sale.quantity || 0));
            });

            const sortedDates = Array.from(salesByDate.keys()).sort();

            const chartData = {
                labels: sortedDates,
                datasets: [{
                    label: 'Quantity Sold',
                    data: sortedDates.map(date => salesByDate.get(date) || 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                }]
            };

            // Determine dietary information based on ingredient categories
            const categories = new Set<string>();
            ingredients.forEach(ing => {
                if (ing.category) categories.add(ing.category.toLowerCase());
            });

            const dietary = {
                vegetarian: !categories.has('meat') && !categories.has('seafood'),
                vegan: !categories.has('meat') && !categories.has('seafood') && !categories.has('dairy') && !categories.has('eggs'),
                glutenFree: !categories.has('gluten') && !categories.has('wheat'),
                dairyFree: !categories.has('dairy'),
            };

            return {
                dishDetails: {
                    id: dishData.id,
                    name: dishData.name,
                    price: dishData.price,
                    ingredients,
                    dietary
                },
                salesMetrics: {
                    totalQuantity,
                    totalRevenue,
                    totalCost,
                    profit,
                    profitMargin,
                    costPercentage,
                    ingredientCostPerUnit: totalIngredientCost
                },
                chartData
            };
        } catch (error) {
            console.error('Error fetching dish performance:', error);
            throw error;
        }
    }
}; 