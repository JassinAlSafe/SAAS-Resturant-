import { supabase } from "@/lib/supabase/client";
import { DateRange } from "react-day-picker";
import { format, eachDayOfInterval, differenceInDays } from "date-fns";
import type { InventoryUsageData } from '@/app/(protected)/reports/types/service-types';

// Define types for database schema
interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    cost: number;
    category: string;
    reorder_level: number;
    supplier_id?: string;
}

interface RecipeIngredient {
    quantity: number;
    ingredients: Ingredient;
}

interface Recipe {
    id: string;
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
    recipes?: Recipe;
}

export const inventoryAnalyticsService = {
    /**
     * Get inventory usage data based on sales and recipes
     */
    async getInventoryUsageData(dateRange: DateRange): Promise<InventoryUsageData> {
        if (!dateRange.from || !dateRange.to) {
            throw new Error("Invalid date range");
        }

        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");
        const daysInRange = differenceInDays(dateRange.to, dateRange.from) + 1;

        try {
            // Fetch current inventory items
            const { data: inventoryItems, error: inventoryError } = await supabase
                .from('ingredients')
                .select('*');

            if (inventoryError) throw inventoryError;

            // Fetch sales data with recipe information
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select(`
          *,
          recipes:dish_id(
            id,
            name, 
            price, 
            food_cost,
            recipe_ingredients(
              quantity,
              ingredients(id, name, cost, quantity, unit, category, reorder_level)
            )
          )
        `)
                .gte('date', fromDate)
                .lte('date', toDate)
                .order('date', { ascending: true });

            if (salesError) throw salesError;

            // Generate all dates in the range for consistent charting
            const allDates = eachDayOfInterval({
                start: dateRange.from,
                end: dateRange.to
            });

            // Initialize ingredient usage tracking
            const ingredientUsage = new Map<string, {
                id: string;
                name: string;
                totalUsed: number;
                usageByDate: Record<string, number>;
                unit: string;
                cost: number;
                category: string;
                currentStock: number;
                minStockLevel: number;
            }>();

            // Initialize with all inventory items, even if they have no usage
            if (inventoryItems && inventoryItems.length > 0) {
                inventoryItems.forEach(item => {
                    ingredientUsage.set(item.id, {
                        id: item.id,
                        name: item.name,
                        totalUsed: 0,
                        usageByDate: {},
                        unit: item.unit || '',
                        cost: item.cost || 0,
                        category: item.category || 'Uncategorized',
                        currentStock: item.quantity || 0,
                        minStockLevel: item.reorder_level || 0
                    });
                });
            }

            // Process sales data to calculate ingredient usage
            (salesData as Sale[] || []).forEach(sale => {
                const saleDate = typeof sale.date === 'string' ? sale.date : format(sale.date, "yyyy-MM-dd");
                const quantity = sale.quantity || 0;

                // Skip if no recipe data
                if (!sale.recipes || !sale.recipes.recipe_ingredients) return;

                // Process each ingredient in the recipe
                sale.recipes.recipe_ingredients.forEach((recipeIngredient: RecipeIngredient) => {
                    const ingredient = recipeIngredient.ingredients;
                    if (!ingredient) return;

                    const ingredientId = ingredient.id;
                    const usedQuantity = recipeIngredient.quantity * quantity;

                    // Initialize or update ingredient usage tracking
                    if (!ingredientUsage.has(ingredientId)) {
                        ingredientUsage.set(ingredientId, {
                            id: ingredientId,
                            name: ingredient.name,
                            totalUsed: 0,
                            usageByDate: {},
                            unit: ingredient.unit || '',
                            cost: ingredient.cost || 0,
                            category: ingredient.category || 'Uncategorized',
                            currentStock: ingredient.quantity || 0,
                            minStockLevel: ingredient.reorder_level || 0
                        });
                    }

                    const usage = ingredientUsage.get(ingredientId)!;
                    usage.totalUsed += usedQuantity;

                    if (!usage.usageByDate[saleDate]) {
                        usage.usageByDate[saleDate] = 0;
                    }
                    usage.usageByDate[saleDate] += usedQuantity;
                });
            });

            // Prepare datasets for charting
            const labels: string[] = allDates.map(date => format(date, "MMM d"));

            // Add top 5 most used ingredients to chart
            const topIngredients = Array.from(ingredientUsage.values())
                .sort((a, b) => b.totalUsed - a.totalUsed)
                .slice(0, 5);

            const colors = [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
            ];

            const datasets = topIngredients.map((ingredient, index) => ({
                label: ingredient.name,
                data: allDates.map(date => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return ingredient.usageByDate[dateStr] || 0;
                }),
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.5', '1'),
                tension: 0.1,
            }));

            // Prepare inventory items in the format expected by the UI
            const inventory = Array.from(ingredientUsage.values())
                .map(data => {
                    const avgDailyUsage = data.totalUsed / daysInRange;
                    const daysUntilDepletion = avgDailyUsage > 0
                        ? Math.round(data.currentStock / avgDailyUsage)
                        : Infinity;

                    return {
                        id: data.id,
                        name: data.name,
                        currentStock: data.currentStock,
                        unit: data.unit,
                        costPerUnit: data.cost,
                        reorderLevel: data.minStockLevel,
                        usage: data.totalUsed,
                        daysUntilDepletion: daysUntilDepletion === Infinity ? 999 : daysUntilDepletion,
                        totalCost: data.cost * data.currentStock,
                        category: data.category
                    };
                })
                .sort((a, b) => a.daysUntilDepletion - b.daysUntilDepletion);

            // Calculate total cost
            const totalCost = Array.from(ingredientUsage.values()).reduce((sum, data) =>
                sum + (data.cost * data.totalUsed), 0);

            // Calculate average daily usage
            const averageDailyUsage: Record<string, number> = {};
            ingredientUsage.forEach((data, id) => {
                averageDailyUsage[id] = data.totalUsed / daysInRange;
            });

            // Calculate profitable ingredients
            const profitableIngredients = Array.from(ingredientUsage.values())
                .map(data => ({
                    id: data.id,
                    name: data.name,
                    usage: data.totalUsed,
                    costPerUnit: data.cost,
                    efficiency: data.totalUsed > 0 ? (data.cost / data.totalUsed) : 0
                }))
                .sort((a, b) => b.efficiency - a.efficiency)
                .slice(0, 5);

            // Identify critical items
            const criticalItems = Array.from(ingredientUsage.values())
                .map(data => {
                    const avgUsage = data.totalUsed / daysInRange;
                    const daysUntilDepletion = avgUsage > 0
                        ? Math.round(data.currentStock / avgUsage)
                        : Infinity;

                    // Consider items critical if:
                    // 1. They'll be depleted soon (<=3 days)
                    // 2. They have a warning status (4-7 days)
                    // 3. Their current stock is below reorder level
                    const belowReorderLevel = data.currentStock <= data.minStockLevel;

                    return {
                        id: data.id,
                        name: data.name,
                        depletion: daysUntilDepletion === Infinity ? 'N/A' : `${daysUntilDepletion} days`,
                        depleted: daysUntilDepletion <= 3,
                        warning: daysUntilDepletion <= 7 && daysUntilDepletion > 3 || belowReorderLevel,
                        currentStock: data.currentStock,
                        reorderLevel: data.minStockLevel
                    };
                })
                // Filter to include:
                // 1. Genuinely critical items
                // 2. Items below reorder level
                // 3. Fall back to at least top 5 most used items if no truly critical items
                .filter(item => {
                    // If the item is depleted or has warning, include it
                    if (item.depleted || item.warning) return true;

                    // If the item's current stock is below reorder level, include it
                    if (item.currentStock <= item.reorderLevel) return true;

                    // Return false for other items - we'll handle empty case separately
                    return false;
                })
                .sort((a, b) => {
                    const getDays = (depletion: string) =>
                        depletion === 'N/A' ? Infinity : parseInt(depletion.split(' ')[0]);
                    return getDays(a.depletion) - getDays(b.depletion);
                })
                .slice(0, 5);

            // If no critical items found, include the top 5 most used items as a fallback
            if (criticalItems.length === 0) {
                const topUsedItems = Array.from(ingredientUsage.values())
                    .sort((a, b) => b.totalUsed - a.totalUsed)
                    .slice(0, 5)
                    .map(data => ({
                        id: data.id,
                        name: data.name,
                        depletion: 'Monitor usage',
                        depleted: false,
                        warning: true,
                        currentStock: data.currentStock,
                        reorderLevel: data.minStockLevel
                    }));

                criticalItems.push(...topUsedItems);
            }

            return {
                labels,
                datasets,
                inventory,
                analytics: {
                    totalCost,
                    averageDailyUsage,
                    profitableIngredients,
                    criticalItems
                }
            };
        } catch (error) {
            console.error('Error fetching inventory usage data:', error);
            // Return empty data structure instead of throwing
            return {
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
    }
};