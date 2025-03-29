// lib/services/recipe-service.ts
import { supabase } from '@/lib/supabase/browser-client';
import { Dish, DishIngredient } from '@/lib/types';
import { getCurrentUser } from '../utils/Auth/auth-utils';

/**
 * Helper function to safely extract user from getCurrentUser result
 */
const extractUserFromAuthResult = async () => {
    const result = await getCurrentUser();

    if (!result || !result.user) {
        throw new Error('User not authenticated');
    }

    return result.user;
};

// ===== Data Models =====

/**
 * Database representation of dish ingredients
 */
interface DbDishIngredient {
    dish_id: string;
    ingredient_id: string;
    quantity: number;
    unit?: string;
}

/**
 * Database representation of a recipe
 */
interface DbRecipe {
    id: string;
    name: string;
    description: string;
    price: number;
    food_cost: number;
    category: string;
    allergies: string[];
    popularity: number;
    image_url: string;
    user_id: string;
    dish_id: string | null | undefined;
    business_profile_id: string;
    is_archived: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Define interface for ingredient data
 */
interface IngredientData {
    id: string;
    name?: string;
    unit?: string;
    cost?: number;
    quantity?: number;
    business_profile_id?: string;
    category: string;
}

// ===== Error Handling =====

/**
 * Centralized error handling for service methods
 */
const handleServiceError = (error: unknown, operation: string): never => {
    console.error(`Error in ${operation}:`, error);

    if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }

    console.error('Unknown error type:', typeof error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Unknown error occurred during ${operation}`);
};

// ===== Data Access Layer =====

/**
 * Repository methods for recipe data access
 */
const recipeRepository = {
    /**
     * Find a recipe by ID for a specific user
     */
    async findById(id: string, userId: string): Promise<DbRecipe | null> {
        const { data, error } = await supabase
            .from('recipes')
            .select(`
        id, name, description, price, food_cost, category, 
        allergies, popularity, image_url, created_at, 
        updated_at, dish_id, is_archived, user_id, business_profile_id
      `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Find all recipes for a user with optional archived filter
     */
    async findAllByUser(userId: string, includeArchived = false): Promise<DbRecipe[]> {
        let query = supabase
            .from('recipes')
            .select(`
        id, name, description, price, food_cost, category, 
        allergies, popularity, image_url, created_at, 
        updated_at, dish_id, is_archived, user_id, business_profile_id
      `)
            .eq('user_id', userId);

        if (!includeArchived) {
            query = query.or('is_archived.is.null,is_archived.eq.false');
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    /**
     * Find ingredients for a dish
     */
    async findIngredientsByDishId(dishId: string): Promise<DbDishIngredient[]> {
        const { data, error } = await supabase
            .from('dish_ingredients')
            .select('dish_id, ingredient_id, quantity, unit')
            .eq('dish_id', dishId);

        if (error) throw error;
        return data || [];
    },

    /**
     * Check if a dish has sales references
     */
    async hasSalesReferences(dishId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('sales')
            .select('id')
            .eq('dish_id', dishId)
            .limit(1);

        if (error) throw error;
        return (data && data.length > 0);
    },

    /**
     * Create a new recipe
     */
    async createRecipe(recipe: Omit<DbRecipe, 'id'>): Promise<DbRecipe> {
        const { data, error } = await supabase
            .from('recipes')
            .insert(recipe)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Recipe creation failed - no recipe returned from database');
        return data;
    },

    /**
     * Create a new dish
     */
    async createDish(dish: { name: string; price: number; business_profile_id: string }): Promise<{ id: string }> {
        const { data, error } = await supabase
            .from('dishes')
            .insert(dish)
            .select('id')
            .single();

        if (error) throw error;
        if (!data || !data.id) throw new Error('Dish record was created but no ID was returned');
        return data;
    },

    /**
     * Add ingredients to a dish
     */
    async addDishIngredients(ingredients: DbDishIngredient[]): Promise<void> {
        const { error } = await supabase
            .from('dish_ingredients')
            .insert(ingredients);

        if (error) throw error;
    },

    /**
     * Update a recipe
     */
    async updateRecipe(id: string, userId: string, recipe: Partial<DbRecipe>): Promise<void> {
        const { error } = await supabase
            .from('recipes')
            .update(recipe)
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Delete a recipe
     */
    async deleteRecipe(id: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Delete dish ingredients
     */
    async deleteDishIngredients(dishId: string): Promise<void> {
        const { error } = await supabase
            .from('dish_ingredients')
            .delete()
            .eq('dish_id', dishId);

        if (error) throw error;
    },

    /**
     * Delete a dish
     */
    async deleteDish(dishId: string): Promise<void> {
        const { error } = await supabase
            .from('dishes')
            .delete()
            .eq('id', dishId);

        if (error) throw error;
    },

    /**
     * Find ingredients by their IDs
     */
    async findIngredientsByIds(ids: string[]): Promise<IngredientData[]> {
        const { data, error } = await supabase
            .from('ingredients')
            .select('id, unit, cost, name, category')
            .in('id', ids);

        if (error) throw error;
        return data || [];
    },

    /**
     * Find ingredients by name
     */
    async findIngredientsByNames(names: string[]): Promise<IngredientData[]> {
        const { data, error } = await supabase
            .from('ingredients')
            .select('id, name, category')
            .in('name', names);

        if (error) throw error;
        return data || [];
    },

    /**
     * Create new ingredients
     */
    async createIngredients(ingredients: Omit<IngredientData, 'id'>[]): Promise<IngredientData[]> {
        const { data, error } = await supabase
            .from('ingredients')
            .insert(ingredients)
            .select('id, name, category');

        if (error) throw error;
        return data || [];
    }
};

// ===== Business Logic Helper Methods =====

/**
 * Maps a database recipe to the domain model
 */
const mapDbRecipeToDish = (recipe: DbRecipe, ingredients: DishIngredient[] = []): Dish => {
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
        createdAt: recipe.created_at || new Date().toISOString(),
        updatedAt: recipe.updated_at || new Date().toISOString(),
        isArchived: recipe.is_archived || false
    };
};

/**
 * Map dish ingredients from database to domain model
 */
const mapDbIngredientsToModel = (dbIngredients: DbDishIngredient[]): DishIngredient[] => {
    return dbIngredients.map(item => ({
        ingredientId: item.ingredient_id,
        quantity: item.quantity,
        unit: item.unit
    }));
};

/**
 * Ensures a business profile exists for a user
 */
const ensureBusinessProfileExists = async (userId: string): Promise<string> => {
    try {
        // First try to get from business_profile_users table
        const { data: businessProfileData, error: profileError } = await supabase
            .from('business_profile_users')
            .select('business_profile_id')
            .eq('user_id', userId)
            .single();

        if (!profileError && businessProfileData?.business_profile_id) {
            return businessProfileData.business_profile_id;
        }

        // If that fails, try direct query to business_profiles
        const { data: businessProfiles, error: profilesError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (!profilesError && businessProfiles?.length > 0 && businessProfiles[0].id) {
            return businessProfiles[0].id;
        }

        // Last resort: query to check if any business profiles exist
        const { data: allProfiles, error: allProfilesError } = await supabase
            .from('business_profiles')
            .select('id')
            .limit(1);

        if (!allProfilesError && allProfiles?.length > 0) {
            return allProfiles[0].id;
        }

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

        if (!createError && newProfile?.id) {
            return newProfile.id;
        }

        throw new Error('Failed to find or create a business profile');
    } catch (error) {
        console.error('Error in getBusinessProfileId:', error);

        // Development fallback
        if (process.env.NODE_ENV === 'development') {
            const fallbackId = '15c2b5a0-04c7-44bc-b619-e39c7082f164';
            console.warn('Using hardcoded fallback business profile ID for development:', fallbackId);
            return fallbackId;
        }

        throw new Error('No business profile found and unable to create one');
    }
};

/**
 * Resolves ingredient IDs from names or IDs
 */
const resolveIngredientsByNameOrId = async (
    ingredients: DishIngredient[],
    businessProfileId: string
): Promise<DishIngredient[]> => {
    if (!ingredients || ingredients.length === 0) {
        return [];
    }

    try {
        // Separate ingredients that might be names vs IDs
        const potentialNames = ingredients.filter(ing =>
            typeof ing.ingredientId === 'string' && ing.ingredientId.length < 36);
        const validIds = ingredients.filter(ing =>
            typeof ing.ingredientId === 'string' && ing.ingredientId.length === 36);

        // If no potential names, just return the valid IDs
        if (potentialNames.length === 0) {
            return validIds;
        }

        // Get the list of names to look up
        const ingredientNames = potentialNames.map(ing => ing.ingredientId as string);

        // Look up existing ingredients by name
        const existingIngredients = await recipeRepository.findIngredientsByNames(ingredientNames);

        // Create a map of name -> id for found ingredients
        const nameToIdMap: Record<string, string> = {};
        existingIngredients.forEach(ing => {
            if (ing.name) {
                nameToIdMap[ing.name.toLowerCase()] = ing.id;
            }
        });

        // Collect ingredients that need to be created
        const ingredientsToCreate = potentialNames
            .filter(ing => !nameToIdMap[(ing.ingredientId as string).toLowerCase()])
            .map(ing => ({
                name: ing.ingredientId,
                unit: ing.unit || 'piece',
                cost: 0,
                quantity: 0,
                business_profile_id: businessProfileId,
                category: 'Other'
            }));

        // Create any missing ingredients
        if (ingredientsToCreate.length > 0) {
            const newIngredients = await recipeRepository.createIngredients(ingredientsToCreate);

            // Add the new ingredients to our map
            newIngredients.forEach(ing => {
                if (ing.name) {
                    nameToIdMap[ing.name.toLowerCase()] = ing.id;
                }
            });
        }

        // Map all potential names to their actual IDs
        const resolvedNameIngredients = potentialNames.map(ing => {
            const resolvedId = nameToIdMap[(ing.ingredientId as string).toLowerCase()];
            if (resolvedId) {
                return { ...ing, ingredientId: resolvedId };
            }
            return ing;
        });

        // Filter to only include ingredients with valid UUIDs
        const validResolvedIngredients = resolvedNameIngredients.filter(ing => {
            const isValidUuid = typeof ing.ingredientId === 'string' &&
                ing.ingredientId.length === 36 &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ing.ingredientId);
            return isValidUuid;
        });

        // Combine with the valid IDs and return
        return [...validIds, ...validResolvedIngredients];
    } catch (error) {
        console.error('Error resolving ingredients:', error);
        // Return only the valid IDs we already collected
        return ingredients.filter(ing =>
            typeof ing.ingredientId === 'string' &&
            ing.ingredientId.length === 36);
    }
};

// ===== Recipe Service =====

export const recipeService = {
    /**
     * Get all recipes for the current user
     */
    async getRecipes(includeArchived = false): Promise<Dish[]> {
        try {
            const user = await extractUserFromAuthResult();

            const recipes = await recipeRepository.findAllByUser(user.id, includeArchived);

            // Extract dish IDs for fetching ingredients
            const dishIds = recipes
                .filter(recipe => recipe.dish_id)
                .map(recipe => recipe.dish_id!);

            // Build map of dish_id -> ingredients
            const dishIngredientsMap: Record<string, DishIngredient[]> = {};

            if (dishIds.length > 0) {
                // Fetch all ingredients in a single query
                const allIngredients = await Promise.all(
                    dishIds.map(id => recipeRepository.findIngredientsByDishId(id))
                ).then(results => results.flat());

                // Group by dish_id
                allIngredients.forEach(ingredient => {
                    if (!dishIngredientsMap[ingredient.dish_id]) {
                        dishIngredientsMap[ingredient.dish_id] = [];
                    }
                    dishIngredientsMap[ingredient.dish_id].push({
                        ingredientId: ingredient.ingredient_id,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit
                    });
                });
            }

            // Map to domain model
            return recipes.map(recipe => {
                const ingredients = recipe.dish_id
                    ? dishIngredientsMap[recipe.dish_id] || []
                    : [];

                return mapDbRecipeToDish(recipe, ingredients);
            });
        } catch (error) {
            return handleServiceError(error, 'getRecipes');
        }
    },

    /**
     * Get a recipe by ID
     */
    async getRecipeById(id: string): Promise<Dish | null> {
        try {
            const user = await extractUserFromAuthResult();

            const recipe = await recipeRepository.findById(id, user.id);
            if (!recipe) return null;

            // Fetch ingredients if the recipe has a dish_id
            let ingredients: DishIngredient[] = [];
            if (recipe.dish_id) {
                const dbIngredients = await recipeRepository.findIngredientsByDishId(recipe.dish_id);
                ingredients = mapDbIngredientsToModel(dbIngredients);
            }

            return mapDbRecipeToDish(recipe, ingredients);
        } catch (error) {
            handleServiceError(error, 'getRecipeById');
            return null; // Only reach here if handleServiceError is modified to not throw
        }
    },

    /**
     * Add a new recipe
     */
    async addRecipe(dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish | null> {
        try {
            const user = await extractUserFromAuthResult();

            // Get the business profile ID
            const businessProfileId = await ensureBusinessProfileExists(user.id);

            // Validate essential data
            if (!dish.name) throw new Error('Recipe name is required');
            if (typeof dish.price !== 'number' || dish.price <= 0) throw new Error('Valid recipe price is required');

            // Create a dish record if we have ingredients
            let dishId: string | null = null;
            if (dish.ingredients && dish.ingredients.length > 0) {
                const dishData = await recipeRepository.createDish({
                    name: dish.name,
                    price: dish.price,
                    business_profile_id: businessProfileId
                });
                dishId = dishData.id;
            }

            // Prepare recipe data
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

            // Create the recipe
            const recipe = await recipeRepository.createRecipe(recipeData);

            // Handle ingredients if present
            if (dish.ingredients?.length > 0 && dishId) {
                // Resolve ingredients by name or ID
                const resolvedIngredients = await resolveIngredientsByNameOrId(
                    dish.ingredients,
                    businessProfileId
                );

                if (resolvedIngredients.length > 0) {
                    // Get ingredient data for units
                    const ingredientIds = resolvedIngredients
                        .filter(ing => ing.ingredientId)
                        .map(ing => ing.ingredientId);

                    const ingredientsData = await recipeRepository.findIngredientsByIds(ingredientIds);

                    // Prepare dish_ingredients
                    const dishIngredients = resolvedIngredients
                        .filter(ing => ing.ingredientId)
                        .map(ingredient => {
                            const ingredientData = ingredientsData?.find(ing => ing.id === ingredient.ingredientId);

                            return {
                                dish_id: dishId!,
                                ingredient_id: ingredient.ingredientId,
                                quantity: ingredient.quantity || 1,
                                unit: ingredient.unit || ingredientData?.unit || 'piece'
                            };
                        });

                    if (dishIngredients.length > 0) {
                        await recipeRepository.addDishIngredients(dishIngredients);
                    }
                }
            }

            // Return the complete dish
            return this.getRecipeById(recipe.id);
        } catch (error) {
            return handleServiceError(error, 'addRecipe');
        }
    },

    /**
     * Update an existing recipe
     */
    async updateRecipe(id: string, dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish | null> {
        try {
            const user = await extractUserFromAuthResult();

            // Update the recipe
            await recipeRepository.updateRecipe(id, user.id, {
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
            });

            // Get the updated recipe
            return this.getRecipeById(id);
        } catch (error) {
            return handleServiceError(error, 'updateRecipe');
        }
    },

    /**
     * Delete a recipe
     */
    async deleteRecipe(id: string): Promise<{ success: boolean, hasSalesReferences: boolean }> {
        try {
            const user = await extractUserFromAuthResult();

            // Get the recipe to find its dish_id
            const recipe = await recipeRepository.findById(id, user.id);
            if (!recipe) throw new Error('Recipe not found');

            // Check if the dish is referenced in sales
            if (recipe.dish_id) {
                const hasSalesReferences = await recipeRepository.hasSalesReferences(recipe.dish_id);
                if (hasSalesReferences) {
                    return { success: false, hasSalesReferences: true };
                }
            }

            // Delete the recipe first
            await recipeRepository.deleteRecipe(id, user.id);

            // If the recipe has a dish_id, delete its ingredients and the dish
            if (recipe.dish_id) {
                await recipeRepository.deleteDishIngredients(recipe.dish_id);
                await recipeRepository.deleteDish(recipe.dish_id);
            }

            return { success: true, hasSalesReferences: false };
        } catch (error) {
            handleServiceError(error, 'deleteRecipe');
            return { success: false, hasSalesReferences: false };
        }
    },

    /**
     * Archive a recipe instead of deleting it
     */
    async archiveRecipe(id: string): Promise<boolean> {
        try {
            const user = await extractUserFromAuthResult();

            await recipeRepository.updateRecipe(id, user.id, {
                is_archived: true,
                updated_at: new Date().toISOString()
            });

            return true;
        } catch (error) {
            handleServiceError(error, 'archiveRecipe');
            return false;
        }
    },

    /**
     * Unarchive a recipe
     */
    async unarchiveRecipe(id: string): Promise<boolean> {
        try {
            const user = await extractUserFromAuthResult();

            await recipeRepository.updateRecipe(id, user.id, {
                is_archived: false,
                updated_at: new Date().toISOString()
            });

            return true;
        } catch (error) {
            handleServiceError(error, 'unarchiveRecipe');
            return false;
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

            // Get ingredient costs
            const ingredientData = await recipeRepository.findIngredientsByIds(ingredientIds);

            // Calculate total cost using our helper with safety checks
            let total = 0;
            for (const recipeIng of ingredients) {
                const ingredient = ingredientData.find(ing => ing.id === recipeIng.ingredientId);
                if (ingredient && ingredient.cost !== undefined) {
                    total += (ingredient.cost * (recipeIng.quantity || 1));
                }
            }
            return total;
        } catch (error) {
            handleServiceError(error, 'calculateRecipeCost');
            return 0;
        }
    }
};