import { supabase } from '@/lib/supabase';
import { Dish, DishIngredient } from '@/lib/types';

// Database representation of dish ingredients
interface DbDishIngredient {
    dish_id: string;
    ingredient_id: string;
    quantity: number;
}

interface RecipeWithIngredients {
    id: string;
    name: string;
    description?: string;
    price: number;
    food_cost?: number;
    category?: string;
    allergies?: string[];
    popularity?: number;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
    is_archived?: boolean;
    dish_id?: string;
    dish_ingredients?: DbDishIngredient[];
    ingredients?: {
        ingredient_id: string;
        quantity: number;
    }[];
}

export const recipeService = {
    /**
     * Get all recipes
     */
    async getRecipes(includeArchived = false): Promise<Dish[]> {
        try {
            console.log('Fetching recipes...');

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

            // Build the query
            let query = supabase
                .from('recipes')
                .select(`
                    id,
                    name,
                    description,
                    price,
                    food_cost,
                    category,
                    allergies,
                    popularity,
                    image_url,
                    created_at,
                    updated_at,
                    is_archived,
                    dish_id
                `)
                .eq('user_id', user.id);

            // Filter out archived recipes unless specifically requested
            if (!includeArchived) {
                // First try with is_archived column
                try {
                    query = query.or('is_archived.is.null,is_archived.eq.false');
                } catch {
                    // If the column doesn't exist, just continue without filtering
                    console.log('is_archived column may not exist, continuing without filtering');
                }
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching recipes:', error);
                throw error;
            }

            if (!data) {
                return [];
            }

            // Fetch ingredients for all recipes that have a dish_id
            const dishIds = data
                .filter(recipe => recipe.dish_id)
                .map(recipe => recipe.dish_id);

            let dishIngredientsMap: Record<string, DbDishIngredient[]> = {};

            if (dishIds.length > 0) {
                const { data: dishIngredients, error: ingredientsError } = await supabase
                    .from('dish_ingredients')
                    .select('dish_id, ingredient_id, quantity')
                    .in('dish_id', dishIds);

                if (ingredientsError) {
                    console.error('Error fetching dish ingredients:', ingredientsError);
                } else if (dishIngredients) {
                    // Group ingredients by dish_id
                    dishIngredientsMap = (dishIngredients as DbDishIngredient[]).reduce<Record<string, DbDishIngredient[]>>((acc, item) => {
                        if (!acc[item.dish_id]) {
                            acc[item.dish_id] = [];
                        }
                        acc[item.dish_id].push(item);
                        return acc;
                    }, {});
                }
            }

            // Map the data to our Dish interface
            return data.map((recipe: RecipeWithIngredients) => {
                // Get ingredients for this recipe if it has a dish_id
                const ingredients = recipe.dish_id
                    ? (dishIngredientsMap[recipe.dish_id] || []).map(ingredient => ({
                        ingredientId: ingredient.ingredient_id,
                        quantity: ingredient.quantity
                    }))
                    : [];

                return {
                    id: recipe.id,
                    name: recipe.name,
                    description: recipe.description || '',
                    price: recipe.price,
                    foodCost: recipe.food_cost || 0,
                    category: recipe.category || '',
                    allergies: recipe.allergies || [],
                    popularity: recipe.popularity || 0,
                    imageUrl: recipe.image_url || '',
                    ingredients: ingredients,
                    createdAt: recipe.created_at || '',
                    updatedAt: recipe.updated_at || '',
                    isArchived: recipe.is_archived || false
                };
            });
        } catch (error) {
            console.error('Exception in getRecipes:', error);
            throw error;
        }
    },

    /**
     * Get recipe by ID
     */
    async getRecipeById(id: string): Promise<Dish | null> {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return null;
            }

            const { data: recipe, error } = await supabase
                .from('recipes')
                .select(`
                    id,
                    name,
                    description,
                    price,
                    food_cost,
                    category,
                    allergies,
                    popularity,
                    image_url,
                    created_at,
                    updated_at,
                    dish_id
                `)
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching recipe:', error);
                throw error;
            }

            if (!recipe) return null;

            // Fetch ingredients if the recipe has a dish_id
            let dbIngredients: DbDishIngredient[] = [];
            if (recipe.dish_id) {
                const { data: dishIngredients, error: ingredientsError } = await supabase
                    .from('dish_ingredients')
                    .select('dish_id, ingredient_id, quantity')
                    .eq('dish_id', recipe.dish_id);

                if (ingredientsError) {
                    console.error('Error fetching dish ingredients:', ingredientsError);
                } else if (dishIngredients) {
                    dbIngredients = dishIngredients as DbDishIngredient[];
                }
            }

            // Transform DB data to our application model
            return {
                id: recipe.id,
                name: recipe.name,
                description: recipe.description,
                price: recipe.price,
                foodCost: recipe.food_cost,
                category: recipe.category,
                allergies: recipe.allergies,
                popularity: recipe.popularity,
                imageUrl: recipe.image_url,
                ingredients: dbIngredients.map(item => ({
                    ingredientId: item.ingredient_id,
                    quantity: item.quantity
                })),
                createdAt: recipe.created_at || new Date().toISOString(),
                updatedAt: recipe.updated_at || new Date().toISOString()
            };
        } catch (error) {
            console.error('Exception in getRecipeById:', error);
            return null;
        }
    },

    /**
     * Add a new recipe
     */
    async addRecipe(dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish | null> {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            console.log('Adding recipe:', dish.name, 'for user:', user.id);

            // First, check if we need to create a dish record
            let dishId: string | null = null;

            if (dish.ingredients && dish.ingredients.length > 0) {
                // Create a dish record first
                const { data: dishData, error: dishError } = await supabase
                    .from('dishes')
                    .insert({
                        name: dish.name,
                        business_profile_id: await this.getBusinessProfileId(user.id)
                    })
                    .select('id')
                    .single();

                if (dishError) {
                    console.error('Error creating dish:', dishError);
                    throw dishError;
                }

                dishId = dishData.id;
                console.log('Created dish with ID:', dishId);
            }

            // Then, insert the recipe
            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .insert({
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    food_cost: dish.foodCost || 0, // Ensure a default value
                    category: dish.category,
                    allergies: dish.allergies,
                    popularity: dish.popularity,
                    image_url: dish.imageUrl,
                    user_id: user.id, // Include the user_id
                    dish_id: dishId // Link to the dish if created
                })
                .select()
                .single();

            if (recipeError) {
                console.error('Error adding recipe:', recipeError);
                // Clean up the dish if it was created
                if (dishId) {
                    await supabase.from('dishes').delete().eq('id', dishId);
                }
                throw recipeError;
            }

            if (!recipe) {
                console.error('Recipe was not created');
                // Clean up the dish if it was created
                if (dishId) {
                    await supabase.from('dishes').delete().eq('id', dishId);
                }
                throw new Error('Recipe creation failed');
            }

            console.log('Recipe created with ID:', recipe.id);

            // Then, insert dish ingredients
            if (dish.ingredients && dish.ingredients.length > 0 && dishId) {
                // Get all ingredient IDs
                const ingredientIds = dish.ingredients.map(ing => ing.ingredientId);

                // Fetch ingredient data to get units
                const { data: ingredientsData, error: ingredientsFetchError } = await supabase
                    .from('ingredients')
                    .select('id, unit, cost')
                    .in('id', ingredientIds);

                if (ingredientsFetchError) {
                    console.error('Error fetching ingredients data:', ingredientsFetchError);
                    // Clean up the recipe and dish
                    await supabase.from('recipes').delete().eq('id', recipe.id);
                    await supabase.from('dishes').delete().eq('id', dishId);
                    throw ingredientsFetchError;
                }

                const ingredientsToInsert = dish.ingredients.map(ingredient => {
                    // Find the corresponding ingredient to get its unit
                    const ingredientData = ingredientsData.find(ing => ing.id === ingredient.ingredientId);

                    return {
                        dish_id: dishId,
                        ingredient_id: ingredient.ingredientId,
                        quantity: ingredient.quantity,
                        unit: ingredientData?.unit || 'piece' // Provide a default unit as fallback
                    };
                });

                console.log('Inserting dish ingredients:', ingredientsToInsert);

                const { error: ingredientsError } = await supabase
                    .from('dish_ingredients')
                    .insert(ingredientsToInsert);

                if (ingredientsError) {
                    console.error('Error adding dish ingredients:', ingredientsError);
                    // Attempt to delete the recipe and dish since ingredients failed
                    await supabase.from('recipes').delete().eq('id', recipe.id);
                    await supabase.from('dishes').delete().eq('id', dishId);
                    throw ingredientsError;
                }
            }

            // Return the complete dish
            return {
                id: recipe.id,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                foodCost: dish.foodCost,
                category: dish.category,
                allergies: dish.allergies,
                popularity: dish.popularity,
                imageUrl: dish.imageUrl,
                ingredients: dish.ingredients || [],
                createdAt: recipe.created_at,
                updatedAt: recipe.updated_at
            };
        } catch (error) {
            // Enhanced error logging
            console.error('Exception in addRecipe:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            } else {
                console.error('Unknown error type:', typeof error);
                console.error('Error details:', JSON.stringify(error, null, 2));
            }
            throw error; // Re-throw the error so it's caught by the hook
        }
    },

    /**
     * Helper method to get business profile ID
     */
    async getBusinessProfileId(userId: string): Promise<string> {
        // First try to get from business_profile_users table
        const { data: businessProfileData, error: profileError } = await supabase
            .from('business_profile_users')
            .select('business_profile_id')
            .eq('user_id', userId)
            .single();

        if (!profileError && businessProfileData) {
            return businessProfileData.business_profile_id;
        }

        // If that fails, try direct query to business_profiles
        const { data: businessProfiles, error: profilesError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (!profilesError && businessProfiles && businessProfiles.length > 0) {
            return businessProfiles[0].id;
        }

        throw new Error('No business profile found for user');
    },

    /**
     * Update an existing recipe
     */
    async updateRecipe(id: string, dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish | null> {
        try {
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

            // Update the recipe
            const { error } = await supabase
                .from('recipes')
                .update({
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    food_cost: dish.foodCost,
                    category: dish.category,
                    allergies: dish.allergies,
                    popularity: dish.popularity,
                    image_url: dish.imageUrl,
                    is_archived: dish.isArchived,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error updating recipe:', error);
                throw error;
            }

            // Get the updated recipe
            return this.getRecipeById(id);
        } catch (error) {
            console.error('Exception in updateRecipe:', error);
            throw error;
        }
    },

    /**
     * Delete a recipe
     */
    async deleteRecipe(id: string): Promise<boolean> {
        try {
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

            // First check if this recipe is referenced in sales
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('id')
                .eq('dish_id', id)
                .limit(1);

            if (salesError) {
                console.error('Error checking sales references:', salesError);
                throw new Error(`Error checking sales: ${salesError.message}`);
            }

            // If the recipe is used in sales, prevent deletion
            if (salesData && salesData.length > 0) {
                throw new Error('Cannot delete this recipe because it is referenced in sales records. Remove the sales records first or archive the recipe instead.');
            }

            // First delete recipe ingredients
            const { error: ingredientsError } = await supabase
                .from('recipe_ingredients')
                .delete()
                .eq('recipe_id', id);

            if (ingredientsError) {
                console.error('Error deleting recipe ingredients:', ingredientsError);
                throw new Error(`Error deleting recipe ingredients: ${ingredientsError.message}`);
            }

            // Then delete the recipe
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Ensure the user owns this recipe

            if (error) {
                console.error('Error deleting recipe:', error);

                // Check for foreign key violation specifically
                if (error.message && error.message.includes('violates foreign key constraint')) {
                    throw new Error('This recipe cannot be deleted because it is referenced by other records in the system. Consider archiving it instead.');
                }

                throw new Error(`Database error: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Exception in deleteRecipe:', error);
            // Create a proper error object with a message
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
                // Handle non-Error objects
                console.error('Non-standard error:', String(error));
            }
            // Always throw an Error object with a message
            throw error instanceof Error ? error : new Error('Unknown error occurred during recipe deletion');
        }
    },

    /**
     * Archive a recipe instead of deleting it
     * This is useful for recipes that are referenced in sales and can't be deleted
     */
    async archiveRecipe(id: string): Promise<boolean> {
        try {
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

            // Update the recipe to mark it as archived
            const { error } = await supabase
                .from('recipes')
                .update({
                    is_archived: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', user.id); // Ensure the user owns this recipe

            if (error) {
                console.error('Error archiving recipe:', error);

                // If the column doesn't exist, we'll get an error
                if (error.message && error.message.includes('column "is_archived" of relation "recipes" does not exist')) {
                    throw new Error('The archive feature is not available. Please contact your administrator to enable this feature.');
                }

                throw new Error(`Database error: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Exception in archiveRecipe:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
                console.error('Non-standard error:', String(error));
            }
            throw error instanceof Error ? error : new Error('Unknown error occurred during recipe archiving');
        }
    },

    /**
     * Unarchive a recipe to make it active again
     */
    async unarchiveRecipe(id: string): Promise<boolean> {
        try {
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

            // Update the recipe to mark it as unarchived
            const { error } = await supabase
                .from('recipes')
                .update({
                    is_archived: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', user.id); // Ensure the user owns this recipe

            if (error) {
                console.error('Error unarchiving recipe:', error);
                throw new Error(`Database error: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Exception in unarchiveRecipe:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
                console.error('Non-standard error:', String(error));
            }
            throw error instanceof Error ? error : new Error('Unknown error occurred during recipe unarchiving');
        }
    },

    /**
     * Calculate the cost of a recipe based on ingredients
     */
    async calculateRecipeCost(ingredients: DishIngredient[]): Promise<number> {
        try {
            if (ingredients.length === 0) return 0;

            // Get all ingredient IDs
            const ingredientIds = ingredients.map(ing => ing.ingredientId);

            // Get ingredient costs from database - ensure we only use columns that exist
            const { data, error } = await supabase
                .from('ingredients')
                .select('id, cost')
                .in('id', ingredientIds);

            if (error) {
                console.error('Error calculating recipe cost:', error);
                throw error;
            }

            // Calculate total cost
            return ingredients.reduce((total, recipeIng) => {
                const ingredient = data.find(ing => ing.id === recipeIng.ingredientId);
                if (ingredient) {
                    return total + (ingredient.cost * recipeIng.quantity);
                }
                return total;
            }, 0);
        } catch (error) {
            console.error('Exception in calculateRecipeCost:', error);
            throw error;
        }
    }
}; 