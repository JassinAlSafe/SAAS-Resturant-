import { supabase } from '@/lib/supabase';
import { Dish, Sale } from '@/lib/types';
import { format } from 'date-fns';

interface SaleRecord {
    id: string;
    dish_id: string;
    dish_name?: string;
    quantity: number;
    total_amount: number;
    date: string;
    created_at: string;
    updated_at?: string;
    notes?: string;
    user_id?: string;
    business_profile_id: string;
}

export const salesService = {
    /**
     * Get all sales for the authenticated user
     */
    async getSales(startDate?: string, endDate?: string): Promise<Sale[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Get the user's business profile
            const { data: businessProfileData, error: profileError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (profileError) throw profileError;
            if (!businessProfileData) throw new Error("No business profile found");

            const businessProfileId = businessProfileData.id;

            // Build the query to get sales with dish information
            let query = supabase
                .from('sales')
                .select(`
                    *,
                    recipes (
                        id,
                        name,
                        price,
                        category
                    )
                `)
                .eq('business_profile_id', businessProfileId)
                .order('created_at', { ascending: false });

            // Add date filters if provided
            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Transform the data to match our Sale type
            return data.map(sale => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: sale.recipes?.name || 'Unknown Dish',
                quantity: sale.quantity,
                totalAmount: sale.total_amount,
                date: sale.date,
                createdAt: sale.created_at,
                updatedAt: sale.updated_at,
                userId: sale.user_id
            }));
        } catch (error) {
            console.error('Error fetching sales:', error);
            throw error;
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

            // Get the user's business profile
            const { data: businessProfile, error: businessError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !businessProfile) {
                console.error('Error fetching business profile:', businessError);
                return [];
            }

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('business_profile_id', businessProfile.id)
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

            // Fetch dish names from recipes table
            const { data: recipesData, error: recipesError } = await supabase
                .from('recipes')
                .select('id, name')
                .eq('business_profile_id', businessProfile.id)
                .in('id', dishIds);

            if (recipesError) {
                console.error('Error fetching dish names for date:', recipesError);
            }

            // Create a map of dish IDs to dish names
            const dishNameMap = new Map();
            if (recipesData && recipesData.length > 0) {
                recipesData.forEach((recipe: { id: string, name: string }) => {
                    dishNameMap.set(recipe.id, recipe.name);
                });
            }

            console.log('Recipe name map for date:', Object.fromEntries(dishNameMap));

            // Transform DB data to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: dishNameMap.get(sale.dish_id) || 'Unknown Recipe',
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

            // Get the user's business profile
            const { data: businessProfile, error: businessError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !businessProfile) {
                console.error('Error fetching business profile:', businessError);
                throw new Error('Business profile not found');
            }

            console.log(`Adding ${entries.length} sales entries for business ${businessProfile.id}`);

            // Transform entries to DB format
            const dbEntries = entries.map(entry => ({
                dish_id: entry.dishId,
                quantity: entry.quantity,
                total_amount: entry.totalAmount,
                date: entry.date,
                user_id: user.id,
                business_profile_id: businessProfile.id
            }));

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

            // Update inventory using dish_ingredients
            for (const sale of data) {
                // First get the recipe with its dish_id
                interface RecipeWithDish {
                    id: string;
                    dish_id?: string;
                    dishes?: {
                        dish_ingredients?: Array<{
                            ingredient_id: string;
                            quantity: number;
                            ingredients?: {
                                id: string;
                                name: string;
                                unit: string;
                                quantity: number;
                            };
                        }>;
                    };
                }

                interface DishIngredient {
                    ingredient_id: string;
                    quantity: number;
                    ingredients?: {
                        id: string;
                        name: string;
                        unit: string;
                        quantity: number;
                    };
                }

                interface PostgrestError {
                    message: string;
                    details: string;
                    hint?: string;
                    code: string;
                }

                const { data: recipe, error: recipeError } = await supabase
                    .from('recipes')
                    .select(`
                        id,
                        dish_id,
                        dishes (
                            dish_ingredients (
                                ingredient_id,
                                quantity,
                                ingredients (
                                    id,
                                    name,
                                    unit,
                                    quantity
                                )
                            )
                        )
                    `)
                    .eq('id', sale.dish_id)
                    .single() as { data: RecipeWithDish | null, error: PostgrestError | null };

                if (recipeError) {
                    console.error('Error fetching recipe:', recipeError);
                    continue;
                }

                if (!recipe) {
                    console.error('Recipe not found:', sale.dish_id);
                    continue;
                }

                // Get ingredients either from dish_ingredients or recipe_ingredients
                let ingredients: DishIngredient[] = [];

                if (recipe.dish_id && recipe.dishes?.dish_ingredients) {
                    // If we have dish_ingredients, use those
                    ingredients = recipe.dishes.dish_ingredients;
                }

                if (ingredients.length === 0) {
                    console.warn(`No ingredients found for recipe ${recipe.id}. Skipping inventory update.`);
                    continue;
                }

                // Update inventory for each ingredient
                for (const ingredient of ingredients) {
                    if (!ingredient.ingredients) {
                        console.warn(`No ingredient details found for ingredient ${ingredient.ingredient_id}`);
                        continue;
                    }

                    const newQuantity = ingredient.ingredients.quantity - (ingredient.quantity * sale.quantity);

                    const { error: updateError } = await supabase
                        .from('ingredients')
                        .update({ quantity: newQuantity })
                        .eq('id', ingredient.ingredients.id);

                    if (updateError) {
                        console.error('Error updating ingredient quantity:', updateError);
                    } else {
                        console.log(`Updated quantity for ingredient ${ingredient.ingredients.name} to ${newQuantity}`);
                    }
                }
            }

            // Transform DB data to our application model
            return data.map((sale: SaleRecord) => ({
                id: sale.id,
                dishId: sale.dish_id,
                dishName: sale.dish_name || 'Unknown Dish',
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
     * Get all recipes
     */
    async getRecipes(): Promise<Dish[]> {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            console.log('Fetching active recipes for user:', user.id);

            // First get recipes
            const { data: recipesData, error: recipesError } = await supabase
                .from('recipes')
                .select(`
                    id,
                    name,
                    price,
                    description,
                    category,
                    food_cost,
                    allergies,
                    popularity,
                    image_url,
                    created_at,
                    updated_at,
                    dish_id
                `)
                .eq('user_id', user.id)
                .eq('is_archived', false);

            if (recipesError) {
                console.error('Error fetching recipes:', recipesError);
                return [];
            }

            if (!recipesData || recipesData.length === 0) {
                console.log('No active recipes found');
                return [];
            }

            // Get dish ingredients for each recipe's dish
            const dishIds = recipesData.map(recipe => recipe.dish_id).filter(Boolean);
            const { data: dishIngredientsData, error: dishIngredientsError } = await supabase
                .from('dish_ingredients')
                .select(`
                    dish_id,
                    ingredient_id,
                    quantity
                `)
                .in('dish_id', dishIds);

            if (dishIngredientsError) {
                console.error('Error fetching dish ingredients:', dishIngredientsError);
                return [];
            }

            // Group dish ingredients by dish_id
            const dishIngredientsMap = (dishIngredientsData || []).reduce((acc, curr) => {
                if (!acc[curr.dish_id]) {
                    acc[curr.dish_id] = [];
                }
                acc[curr.dish_id].push({
                    ingredientId: curr.ingredient_id,
                    quantity: curr.quantity
                });
                return acc;
            }, {} as Record<string, Array<{ ingredientId: string; quantity: number }>>);

            // Transform recipes data to Dish interface
            return recipesData.map((recipe: {
                id: string;
                name: string;
                price: number;
                description?: string;
                category?: string;
                food_cost?: number;
                allergies?: string[];
                popularity?: number;
                image_url?: string;
                created_at?: string;
                updated_at?: string;
                dish_id?: string;
            }) => ({
                id: recipe.id,
                name: recipe.name,
                description: recipe.description || '',
                price: recipe.price,
                foodCost: recipe.food_cost || 0,
                category: recipe.category || '',
                allergies: recipe.allergies || [],
                popularity: recipe.popularity || 0,
                imageUrl: recipe.image_url || '',
                ingredients: recipe.dish_id ? dishIngredientsMap[recipe.dish_id] || [] : [],
                createdAt: recipe.created_at || new Date().toISOString(),
                updatedAt: recipe.updated_at || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Exception in getRecipes:', error);
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

            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            // Get the user's business profile
            const { data: businessProfile, error: businessError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !businessProfile) {
                console.error('Error fetching business profile:', businessError);
                return [];
            }

            const { data, error } = await supabase
                .from('ingredients')
                .select('id, name, unit')
                .eq('business_profile_id', businessProfile.id)
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
    },

    /**
     * Update a sale record
     */
    async updateSale(saleId: string, updates: Partial<Sale>): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Get the business profile ID
            const { data: businessProfileData, error: profileError } = await supabase
                .from('business_profile_users')
                .select('business_profile_id')
                .eq('user_id', user.id)
                .single();

            if (profileError) throw profileError;
            if (!businessProfileData) throw new Error("No business profile found");

            const businessProfileId = businessProfileData.business_profile_id;

            const { error } = await supabase
                .from('sales')
                .update(updates)
                .eq('id', saleId)
                .eq('business_profile_id', businessProfileId)
                .select()
                .single();

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating sale:', error);
            return false;
        }
    },

    /**
     * Delete a sale record
     */
    async deleteSale(saleId: string): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Get the business profile ID
            const { data: businessProfileData, error: profileError } = await supabase
                .from('business_profile_users')
                .select('business_profile_id')
                .eq('user_id', user.id)
                .single();

            if (profileError) throw profileError;
            if (!businessProfileData) throw new Error("No business profile found");

            const businessProfileId = businessProfileData.business_profile_id;

            const { error } = await supabase
                .from('sales')
                .delete()
                .eq('id', saleId)
                .eq('business_profile_id', businessProfileId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting sale:', error);
            return false;
        }
    },

    exportSalesToExcel: async (startDate: string, endDate: string) => {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return { success: false, error: 'User not authenticated' };
            }

            // Fetch sales data for the specified date range
            const { data: sales, error: salesError } = await supabase
                .from('sales')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (salesError) throw salesError;

            // Fetch recipes for dish details
            const { data: recipes, error: recipesError } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', user.id);

            if (recipesError) throw recipesError;

            // Create interfaces that match our actual database structure
            interface SaleRecord {
                id: string;
                dish_id: string;
                quantity: number;
                total_amount: number;
                date: string;
                created_at: string;
                user_id: string;
                notes?: string;
                [key: string]: string | number | boolean | object | null | undefined;
            }

            interface RecipeRecord {
                id: string;
                name: string;
                price: number;
                category?: string;
                user_id: string;
                [key: string]: string | number | boolean | object | null | undefined;
            }

            interface ExportItem {
                date: string;
                dish_name: string;
                quantity: number;
                price: number;
                total: number;
                category: string;
            }

            interface ExportSale {
                id: string;
                date: string;
                items: ExportItem[];
                total: number;
            }

            // Group sales by date for the export
            const salesByDate = (sales as SaleRecord[]).reduce((acc, sale) => {
                const dateKey = sale.date;
                if (!acc[dateKey]) {
                    acc[dateKey] = {
                        id: dateKey, // Use date as ID for the group
                        date: dateKey,
                        items: [],
                        total: 0
                    };
                }

                // Find corresponding recipe
                const recipe = (recipes as RecipeRecord[]).find(r => r.id === sale.dish_id);

                if (recipe) {
                    const item: ExportItem = {
                        date: sale.date,
                        dish_name: recipe.name || 'Unknown Dish',
                        quantity: sale.quantity,
                        price: recipe.price || 0,
                        total: sale.total_amount || recipe.price * sale.quantity,
                        category: recipe.category || 'Uncategorized'
                    };

                    acc[dateKey].items.push(item);
                    acc[dateKey].total += item.total;
                }

                return acc;
            }, {} as Record<string, ExportSale>);

            // Convert to array
            const salesData = Object.values(salesByDate);

            return {
                success: true,
                data: salesData
            };
        } catch (error) {
            console.error('Error exporting sales data:', error);
            return {
                success: false,
                error: error
            };
        }
    }
}; 