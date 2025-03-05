import { supabase } from '@/lib/supabase';
import { Dish, Sale } from '@/lib/types';
import { format } from 'date-fns';

interface SaleRecord {
    id: string;
    dish_id: string;
    quantity: number;
    total_amount: number;
    date: string;
    created_at: string;
    updated_at?: string;
    notes?: string;
    user_id?: string;
}

export const salesService = {
    /**
     * Get all sales for the authenticated user
     */
    async getSales(): Promise<Sale[]> {
        try {
            console.log('Fetching sales...');

            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching sales:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.log('No sales found');
                return [];
            }

            // Get all unique dish IDs from the sales data
            const dishIds = [...new Set(data.map((sale: SaleRecord) => sale.dish_id))];
            console.log('Dish IDs to fetch:', dishIds);

            // Fetch dish names for these IDs
            const { data: dishesData, error: dishesError } = await supabase
                .from('dishes')
                .select('id, name')
                .in('id', dishIds);

            if (dishesError) {
                console.error('Error fetching dish names:', dishesError);
            }

            // Create a map of dish IDs to dish names
            const dishNameMap = new Map();
            if (dishesData && dishesData.length > 0) {
                dishesData.forEach((dish: { id: string, name: string }) => {
                    dishNameMap.set(dish.id, dish.name);
                });
            }

            console.log('Dish name map:', Object.fromEntries(dishNameMap));

            // Transform DB data to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: dishNameMap.get(sale.dish_id) || 'Unknown Dish',
                quantity: sale.quantity,
                totalAmount: sale.total_amount,
                date: sale.date,
                createdAt: sale.created_at,
                userId: sale.user_id
            }));
        } catch (error) {
            console.error('Exception in getSales:', error);
            return [];
        }
    },

    /**
     * Get sales for a specific date
     */
    async getSalesByDate(date: Date): Promise<Sale[]> {
        try {
            // Format date as YYYY-MM-DD
            const formattedDate = format(date, 'yyyy-MM-dd');

            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', formattedDate);

            if (error) {
                console.error('Error fetching sales by date:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.log(`No sales found for date: ${formattedDate}`);
                return [];
            }

            // Get all unique dish IDs from the sales data
            const dishIds = [...new Set(data.map((sale: SaleRecord) => sale.dish_id))];
            console.log('Dish IDs to fetch for date:', dishIds);

            // Fetch dish names for these IDs
            const { data: dishesData, error: dishesError } = await supabase
                .from('dishes')
                .select('id, name')
                .in('id', dishIds);

            if (dishesError) {
                console.error('Error fetching dish names for date:', dishesError);
            }

            // Create a map of dish IDs to dish names
            const dishNameMap = new Map();
            if (dishesData && dishesData.length > 0) {
                dishesData.forEach((dish: { id: string, name: string }) => {
                    dishNameMap.set(dish.id, dish.name);
                });
            }

            console.log('Dish name map for date:', Object.fromEntries(dishNameMap));

            // Transform DB data to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: dishNameMap.get(sale.dish_id) || 'Unknown Dish',
                quantity: sale.quantity,
                totalAmount: sale.total_amount,
                date: sale.date,
                createdAt: sale.created_at,
                userId: sale.user_id
            }));
        } catch (error) {
            console.error('Exception in getSalesByDate:', error);
            return [];
        }
    },

    /**
     * Add multiple sales entries for a date
     */
    async addSales(entries: Omit<Sale, 'id' | 'createdAt'>[]): Promise<Sale[]> {
        try {
            if (entries.length === 0) {
                console.log('No entries provided to addSales');
                return [];
            }

            // Get the authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error('Authentication error:', authError);
                throw new Error(`Authentication failed: ${authError.message}`);
            }

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            console.log(`Adding ${entries.length} sales entries for user ${user.id}`);

            // Transform entries to DB format
            const dbEntries = entries.map(entry => ({
                dish_id: entry.dishId,
                quantity: entry.quantity,
                total_amount: entry.totalAmount,
                date: entry.date,
                user_id: user.id
            }));

            // Create a map of dish IDs to dish names from the input entries
            const inputDishNameMap = new Map();
            entries.forEach(entry => {
                if (entry.dishName) {
                    inputDishNameMap.set(entry.dishId, entry.dishName);
                }
            });

            console.log('Input dish name map:', Object.fromEntries(inputDishNameMap));

            // Log the entries being added for debugging
            console.log('Entries to add:', JSON.stringify(dbEntries, null, 2));

            const { data, error } = await supabase
                .from('sales')
                .insert(dbEntries)
                .select();

            if (error) {
                console.error('Error adding sales entries:', error);
                // Provide more detailed error information
                throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
            }

            if (!data || data.length === 0) {
                console.warn('No data returned after insert');
                return [];
            }

            console.log(`Successfully added ${data.length} sales entries`);

            // Fetch dish names for the sales entries
            const dishIds = data.map((sale: SaleRecord) => sale.dish_id);
            console.log('Dish IDs to fetch:', dishIds);

            // Ensure we have valid UUIDs before querying
            const validDishIds = dishIds.filter(id => {
                const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
                if (!isValid) {
                    console.warn(`Invalid dish ID: ${id}`);
                }
                return isValid;
            });

            console.log('Valid dish IDs:', validDishIds);
            console.log('Invalid dish IDs:', dishIds.filter(id => !validDishIds.includes(id)));

            if (validDishIds.length === 0) {
                console.warn('No valid dish IDs to fetch');
                // Return the data with dish names from the input if available
                return data.map((sale: SaleRecord) => ({
                    id: sale.id,
                    dishId: sale.dish_id,
                    dishName: inputDishNameMap.get(sale.dish_id) || 'Unknown Dish',
                    quantity: sale.quantity,
                    totalAmount: sale.total_amount,
                    date: sale.date,
                    createdAt: sale.created_at,
                    userId: sale.user_id
                }));
            }

            const { data: dishesData, error: dishesError } = await supabase
                .from('dishes')
                .select('id, name')
                .in('id', validDishIds);

            if (dishesError) {
                console.error('Error fetching dish names:', dishesError);
                console.error('Query details:', { table: 'dishes', ids: validDishIds });
                // Continue without dish names from the dishes table, but use input dish names if available
                return data.map((sale: SaleRecord) => ({
                    id: sale.id,
                    dishId: sale.dish_id,
                    dishName: inputDishNameMap.get(sale.dish_id) || 'Unknown Dish (Error)',
                    quantity: sale.quantity,
                    totalAmount: sale.total_amount,
                    date: sale.date,
                    createdAt: sale.created_at,
                    userId: sale.user_id
                }));
            }

            console.log('Dishes data returned:', dishesData);

            // Create a map of dish IDs to dish names
            const dishNameMap = new Map();
            if (dishesData && dishesData.length > 0) {
                dishesData.forEach((dish: { id: string, name: string }) => {
                    dishNameMap.set(dish.id, dish.name);
                });
            } else {
                console.warn('No dish data returned from query');
            }

            console.log('Dish name map:', Object.fromEntries(dishNameMap));

            // Transform DB data back to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: dishNameMap.get(sale.dish_id) || inputDishNameMap.get(sale.dish_id) || 'Unknown Dish',
                quantity: sale.quantity,
                totalAmount: sale.total_amount,
                date: sale.date,
                createdAt: sale.created_at,
                userId: sale.user_id
            }));
        } catch (error) {
            console.error('Exception in addSales:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
                console.error('Unknown error type:', typeof error);
            }
            throw error;
        }
    },

    /**
     * Get all dishes (recipes)
     */
    async getDishes(): Promise<Dish[]> {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            console.log('Fetching dishes for user:', user.id);

            // Try to fetch from dishes table first
            const { data: dishesData, error: dishesError } = await supabase
                .from('dishes')
                .select(`
                    id,
                    name,
                    price,
                    created_at,
                    updated_at
                `);

            console.log('Dishes table query result:', { dishesData, dishesError });

            // If dishes table query fails or returns no data, try recipes table
            if (dishesError || !dishesData || dishesData.length === 0) {
                console.log('No dishes found in dishes table, trying recipes table');

                const { data: recipesData, error: recipesError } = await supabase
                    .from('recipes')
                    .select(`
                        id,
                        name,
                        price,
                        created_at,
                        updated_at,
                        recipe_ingredients (
                            ingredient_id,
                            quantity
                        )
                    `)
                    .eq('user_id', user.id);

                console.log('Recipes table query result:', { recipesData, recipesError });

                if (recipesError) {
                    console.error('Error fetching recipes:', recipesError);
                    // If both tables fail, return empty array
                    if (dishesError) {
                        console.error('Error fetching dishes:', dishesError);
                        return [];
                    }
                } else if (recipesData && recipesData.length > 0) {
                    // Use recipes data if available
                    return recipesData.map((recipe: {
                        id: string;
                        name: string;
                        price: number;
                        created_at?: string;
                        updated_at?: string;
                        recipe_ingredients?: Array<{
                            ingredient_id: string;
                            quantity: number;
                        }>;
                    }) => ({
                        id: recipe.id,
                        name: recipe.name,
                        price: recipe.price,
                        ingredients: recipe.recipe_ingredients?.map((item) => ({
                            ingredientId: item.ingredient_id,
                            quantity: item.quantity
                        })) || [],
                        createdAt: recipe.created_at || new Date().toISOString(),
                        updatedAt: recipe.updated_at || new Date().toISOString()
                    }));
                }
            }

            // If we have dishes data, use it
            if (dishesData && dishesData.length > 0) {
                return dishesData.map((dish: {
                    id: string;
                    name: string;
                    price: number;
                    created_at?: string;
                    updated_at?: string;
                }) => ({
                    id: dish.id,
                    name: dish.name,
                    price: dish.price,
                    ingredients: [], // Dishes table doesn't have ingredients
                    createdAt: dish.created_at || new Date().toISOString(),
                    updatedAt: dish.updated_at || new Date().toISOString()
                }));
            }

            // If we get here, no data was found in either table
            console.warn('No dishes or recipes found');
            return [];
        } catch (error) {
            console.error('Exception in getDishes:', error);
            return [];
        }
    },

    /**
     * Get ingredient details by ID
     */
    async getIngredientDetails(ids: string[]): Promise<{ id: string, name: string, unit: string }[]> {
        try {
            if (ids.length === 0) {
                return [];
            }

            const { data, error } = await supabase
                .from('ingredients')
                .select('id, name, unit')
                .in('id', ids);

            if (error) {
                console.error('Error fetching ingredient details:', error);
                throw error;
            }

            if (!data) {
                return [];
            }

            return data.map((ingredient: { id: string, name: string, unit: string }) => ({
                id: ingredient.id,
                name: ingredient.name,
                unit: ingredient.unit
            }));
        } catch (error) {
            console.error('Exception in getIngredientDetails:', error);
            return [];
        }
    },

    /**
     * Update inventory based on sales
     */
    async updateInventoryFromSales(sales: Sale[]): Promise<boolean> {
        try {
            // Note: In a real implementation, this would reduce inventory quantities based on sales
            console.log('Would update inventory based on sales:', sales);

            // Simulate success
            return true;
        } catch (error) {
            console.error('Exception in updateInventoryFromSales:', error);
            return false;
        }
    }
}; 