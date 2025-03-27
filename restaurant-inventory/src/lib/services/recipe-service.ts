import { supabase } from '@/lib/supabase/browser-client';
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
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error('Authentication error:', authError);
                throw new Error(`Authentication failed: ${authError.message}`);
            }

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            console.log('Adding recipe:', dish.name, 'for user:', user.id);

            // Get the business profile ID with improved error handling
            let businessProfileId;
            try {
                businessProfileId = await this.getBusinessProfileId(user.id);
                console.log('Using business profile ID:', businessProfileId);
            } catch (profileError) {
                console.error('Error getting business profile ID:', profileError);
                throw new Error('Unable to associate recipe with a business profile. Please ensure you have a business profile set up.');
            }

            // Validate essential data
            if (!dish.name) {
                throw new Error('Recipe name is required');
            }

            if (typeof dish.price !== 'number' || dish.price <= 0) {
                throw new Error('Valid recipe price is required');
            }

            // First, check if we need to create a dish record
            let dishId: string | null = null;

            if (dish.ingredients && dish.ingredients.length > 0) {
                // Create a dish record first
                const { data: dishData, error: dishError } = await supabase
                    .from('dishes')
                    .insert({
                        name: dish.name,
                        price: dish.price,
                        business_profile_id: businessProfileId
                    })
                    .select('id')
                    .single();

                if (dishError) {
                    console.error('Error creating dish:', dishError);
                    throw new Error(`Failed to create dish record: ${dishError.message}`);
                }

                if (!dishData || !dishData.id) {
                    throw new Error('Dish record was created but no ID was returned');
                }

                dishId = dishData.id;
                console.log('Created dish with ID:', dishId);
            }

            // Prepare recipe data with defaults for nullable fields
            const recipeData = {
                name: dish.name,
                description: dish.description || '',
                price: dish.price,
                food_cost: dish.foodCost || 0,
                category: dish.category || '',
                allergies: dish.allergies || [],
                popularity: dish.popularity || 0,
                image_url: dish.imageUrl || '',
                user_id: user.id,
                dish_id: dishId,
                business_profile_id: businessProfileId,
                is_archived: dish.isArchived === undefined ? false : dish.isArchived
            };

            // Insert the recipe
            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .insert(recipeData)
                .select()
                .single();

            if (recipeError) {
                console.error('Error adding recipe:', recipeError);
                // Clean up the dish if it was created
                if (dishId) {
                    await supabase.from('dishes').delete().eq('id', dishId);
                }
                throw new Error(`Failed to create recipe: ${recipeError.message}`);
            }

            if (!recipe) {
                console.error('Recipe was not created');
                // Clean up the dish if it was created
                if (dishId) {
                    await supabase.from('dishes').delete().eq('id', dishId);
                }
                throw new Error('Recipe creation failed - no recipe returned from database');
            }

            console.log('Recipe created with ID:', recipe.id);

            // Handle ingredients if present
            if (dish.ingredients && dish.ingredients.length > 0 && dishId) {
                try {
                    // Resolve ingredients by name or ID first
                    const resolvedIngredients = await this.resolveIngredientsByNameOrId(
                        dish.ingredients,
                        businessProfileId
                    );

                    // Get all ingredient IDs after resolution
                    const ingredientIds = resolvedIngredients
                        .filter(ing => ing.ingredientId) // Filter out any invalid entries
                        .map(ing => ing.ingredientId);

                    if (ingredientIds.length === 0) {
                        console.log('No valid ingredient IDs to process after resolution');
                        return this.mapRecipeToResponse(recipe, dish.ingredients);
                    }

                    // Fetch ingredient data to get units
                    const { data: ingredientsData, error: ingredientsFetchError } = await supabase
                        .from('ingredients')
                        .select('id, unit, cost')
                        .in('id', ingredientIds);

                    if (ingredientsFetchError) {
                        console.error('Error fetching ingredients data:', ingredientsFetchError);
                        throw new Error(`Failed to fetch ingredient details: ${ingredientsFetchError.message}`);
                    }

                    // Prepare ingredients data with appropriate fallbacks
                    const ingredientsToInsert = resolvedIngredients
                        .filter(ing => ing.ingredientId)
                        .map(ingredient => {
                            // Find the corresponding ingredient to get its unit
                            const ingredientData = ingredientsData?.find(ing => ing.id === ingredient.ingredientId);

                            return {
                                dish_id: dishId,
                                ingredient_id: ingredient.ingredientId,
                                quantity: ingredient.quantity || 1,
                                unit: ingredient.unit || ingredientData?.unit || 'piece'
                            };
                        });

                    if (ingredientsToInsert.length === 0) {
                        console.log('No ingredient entries to insert after filtering');
                        return this.mapRecipeToResponse(recipe, dish.ingredients);
                    }

                    console.log('Inserting dish ingredients:', ingredientsToInsert);

                    const { error: ingredientsError } = await supabase
                        .from('dish_ingredients')
                        .insert(ingredientsToInsert);

                    if (ingredientsError) {
                        console.error('Error adding dish ingredients:', ingredientsError);
                        // Don't roll back - we'll keep the recipe even if ingredients failed
                        console.log('Keeping recipe despite ingredient insertion failure');
                    }
                } catch (ingredientError) {
                    console.error('Exception processing ingredients:', ingredientError);
                    // Continue and return the recipe even if ingredients processing failed
                }
            }

            // Return the complete dish mapped to our application model
            return this.mapRecipeToResponse(recipe, dish.ingredients);
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
            // Always throw an Error object with a message
            throw error instanceof Error ? error : new Error('Unknown error occurred during recipe creation');
        }
    },

    /**
     * Helper method to map database recipe to response model
     */
    mapRecipeToResponse(recipe: RecipeWithIngredients, ingredients: DishIngredient[] = []): Dish {
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
            ingredients: ingredients || [],
            createdAt: recipe.created_at || new Date().toISOString(),
            updatedAt: recipe.updated_at || new Date().toISOString(),
            isArchived: recipe.is_archived || false
        };
    },

    /**
     * Helper method to get business profile ID
     */
    async getBusinessProfileId(userId: string): Promise<string> {
        console.log('Getting business profile ID for user:', userId);

        try {
            // First try to get from business_profile_users table
            const { data: businessProfileData, error: profileError } = await supabase
                .from('business_profile_users')
                .select('business_profile_id')
                .eq('user_id', userId)
                .single();

            if (!profileError && businessProfileData && businessProfileData.business_profile_id) {
                console.log('Found business profile from business_profile_users:', businessProfileData.business_profile_id);
                return businessProfileData.business_profile_id;
            }

            console.log('Could not find profile in business_profile_users, trying direct query to business_profiles');

            // If that fails, try direct query to business_profiles
            const { data: businessProfiles, error: profilesError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (!profilesError && businessProfiles && businessProfiles.length > 0 && businessProfiles[0].id) {
                console.log('Found business profile from direct query:', businessProfiles[0].id);
                return businessProfiles[0].id;
            }

            // Last resort: query to check if any business profiles exist at all
            const { data: allProfiles, error: allProfilesError } = await supabase
                .from('business_profiles')
                .select('id')
                .limit(1);

            if (!allProfilesError && allProfiles && allProfiles.length > 0) {
                console.log('Using first available business profile as fallback:', allProfiles[0].id);
                return allProfiles[0].id;
            }

            // For development or when we can't find any business profile
            console.log('No business profiles found, creating a default one');
            // Create a default business profile
            const { data: newProfile, error: createError } = await supabase
                .from('business_profiles')
                .insert({
                    user_id: userId,
                    name: 'Default Restaurant',
                    type: 'restaurant',
                    default_currency: 'USD'
                })
                .select('id')
                .single();

            if (!createError && newProfile && newProfile.id) {
                console.log('Created new business profile:', newProfile.id);
                return newProfile.id;
            }

            throw new Error('Failed to find or create a business profile');
        } catch (error) {
            console.error('Error in getBusinessProfileId:', error);

            // Development fallback as absolute last resort
            if (process.env.NODE_ENV === 'development') {
                const fallbackId = '15c2b5a0-04c7-44bc-b619-e39c7082f164'; // Known working ID from database
                console.warn('Using hardcoded fallback business profile ID for development:', fallbackId);
                return fallbackId;
            }

            throw new Error('No business profile found and unable to create one');
        }
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
    async deleteRecipe(id: string): Promise<{ success: boolean, hasSalesReferences: boolean }> {
        try {
            console.log(`Deleting recipe with ID: ${id}`);
            const user = await this.getCurrentUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            // First, get the recipe to find its dish_id
            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .select('dish_id')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (recipeError) {
                console.error('Error getting recipe:', recipeError);
                throw new Error(`Error getting recipe: ${recipeError.message}`);
            }

            if (!recipe) {
                console.error('Recipe not found');
                throw new Error('Recipe not found');
            }

            // Check if the dish is referenced in sales
            if (recipe.dish_id) {
                const { data: salesData, error: salesError } = await supabase
                    .from('sales')
                    .select('id')
                    .eq('dish_id', recipe.dish_id)
                    .limit(1);

                if (salesError) {
                    console.error('Error checking sales references:', salesError);
                    throw new Error(`Error checking sales references: ${salesError.message}`);
                }

                // If there are sales references, don't delete, suggest archiving instead
                if (salesData && salesData.length > 0) {
                    console.log('Recipe has sales references, cannot delete');
                    return { success: false, hasSalesReferences: true };
                }
            }

            // First delete the recipe (this removes the foreign key constraint)
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

            // If the recipe has a dish_id, delete its ingredients next
            if (recipe.dish_id) {
                const { error: ingredientsError } = await supabase
                    .from('dish_ingredients')
                    .delete()
                    .eq('dish_id', recipe.dish_id);

                if (ingredientsError) {
                    console.error('Error deleting recipe ingredients:', ingredientsError);
                    throw new Error(`Error deleting recipe ingredients: ${ingredientsError.message}`);
                }

                // Finally delete the dish
                const { error: dishError } = await supabase
                    .from('dishes')
                    .delete()
                    .eq('id', recipe.dish_id);

                if (dishError) {
                    console.error('Error deleting dish:', dishError);
                    throw new Error(`Error deleting dish: ${dishError.message}`);
                }
            }

            console.log(`Recipe with ID ${id} deleted successfully`);
            return { success: true, hasSalesReferences: false };
        } catch (error) {
            console.error('Exception in deleteRecipe:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
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
    },

    async getCurrentUser(): Promise<{ id: string; email?: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null> {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            throw error;
        }
        return user;
    },

    /**
     * Handle ingredient creation or lookup by name
     * This resolves ingredients that are passed by name instead of ID
     */
    async resolveIngredientsByNameOrId(ingredients: DishIngredient[], businessProfileId: string): Promise<DishIngredient[]> {
        if (!ingredients || ingredients.length === 0) {
            console.log('No ingredients to resolve');
            return [];
        }

        try {
            // Separate ingredients that might be names vs IDs
            const potentialNames = ingredients.filter(ing => typeof ing.ingredientId === 'string' && ing.ingredientId.length < 36);
            const validIds = ingredients.filter(ing => typeof ing.ingredientId === 'string' && ing.ingredientId.length === 36);

            console.log(`Found ${validIds.length} valid UUIDs and ${potentialNames.length} potential names to resolve`);

            // If no potential names, just return the valid IDs
            if (potentialNames.length === 0) {
                return validIds;
            }

            // Get the list of names to look up
            const ingredientNames = potentialNames.map(ing => ing.ingredientId as string);
            console.log('Looking up or creating ingredients with names:', ingredientNames);

            try {
                // First try to find existing ingredients by name
                const { data: existingIngredients, error: lookupError } = await supabase
                    .from('ingredients')
                    .select('id, name')
                    .in('name', ingredientNames);

                if (lookupError) {
                    console.error('Error looking up ingredients by name:', lookupError);
                    // Continue with creation instead of throwing - this is more resilient
                    console.log('Continuing despite lookup error');
                }

                // Create a map of name -> id for found ingredients
                const nameToIdMap: Record<string, string> = {};
                if (existingIngredients && existingIngredients.length > 0) {
                    existingIngredients.forEach(ing => {
                        if (ing.name) {
                            nameToIdMap[ing.name.toLowerCase()] = ing.id;
                            console.log(`Found existing ingredient: ${ing.name} -> ${ing.id}`);
                        }
                    });
                } else {
                    console.log('No existing ingredients found with these names');
                }

                // Collect ingredients that need to be created
                const ingredientsToCreate = potentialNames
                    .filter(ing => !nameToIdMap[ing.ingredientId.toLowerCase()])
                    .map(ing => ({
                        // Only use columns that exist in the ingredients table
                        name: ing.ingredientId,
                        unit: ing.unit || 'piece',
                        cost: 0, // Default cost
                        quantity: 0, // Default quantity
                        business_profile_id: businessProfileId
                    }));

                console.log(`Need to create ${ingredientsToCreate.length} new ingredients`);

                // Create any missing ingredients
                if (ingredientsToCreate.length > 0) {
                    try {
                        console.log('Creating new ingredients:', ingredientsToCreate);
                        const { data: newIngredients, error: createError } = await supabase
                            .from('ingredients')
                            .insert(ingredientsToCreate)
                            .select('id, name');

                        if (createError) {
                            console.error('Error creating new ingredients:', createError);
                            console.log('Continuing with partial data despite creation error');
                        }

                        // Add the new ingredients to our map
                        if (newIngredients && newIngredients.length > 0) {
                            newIngredients.forEach(ing => {
                                if (ing.name) {
                                    nameToIdMap[ing.name.toLowerCase()] = ing.id;
                                    console.log(`Created new ingredient: ${ing.name} -> ${ing.id}`);
                                }
                            });
                        } else {
                            console.log('No new ingredients were returned after creation');
                        }
                    } catch (innerError) {
                        console.error('Exception during ingredient creation:', innerError);
                        console.log('Continuing with partial data');
                    }
                }

                // Now map all potential names to their actual IDs
                const resolvedNameIngredients = potentialNames.map(ing => {
                    const resolvedId = nameToIdMap[ing.ingredientId.toLowerCase()];
                    if (resolvedId) {
                        console.log(`Resolved name ${ing.ingredientId} to ID ${resolvedId}`);
                        return {
                            ...ing,
                            ingredientId: resolvedId
                        };
                    } else {
                        console.log(`Could not resolve name ${ing.ingredientId}, using as-is`);
                        return ing;
                    }
                });

                // Filter to only include ingredients with valid UUIDs
                const validResolvedIngredients = resolvedNameIngredients
                    .filter(ing => {
                        const isValidUuid = typeof ing.ingredientId === 'string' &&
                            ing.ingredientId.length === 36 &&
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ing.ingredientId);

                        if (!isValidUuid) {
                            console.log(`Filtering out invalid UUID: ${ing.ingredientId}`);
                        }
                        return isValidUuid;
                    });

                // Combine with the valid IDs and return
                const result = [...validIds, ...validResolvedIngredients];
                console.log(`Successfully resolved ${result.length} ingredients`);
                return result;

            } catch (outerError) {
                console.error('Error in ingredient lookup/creation:', outerError);
                // Return just the valid IDs we already had
                console.log(`Falling back to ${validIds.length} known valid ingredients`);
                return validIds;
            }
        } catch (error) {
            console.error('Fatal error resolving ingredients:', error);
            // Return an empty array rather than failing completely
            return [];
        }
    },
};