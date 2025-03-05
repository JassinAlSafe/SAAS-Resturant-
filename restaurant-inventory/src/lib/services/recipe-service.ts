import { supabase } from '@/lib/supabase';
import { Dish, DishIngredient } from '@/lib/types';

interface RecipeWithIngredients {
    id: string;
    name: string;
    description?: string;
    price: number;
    food_cost?: number;
    category?: string;
    allergens?: string[];
    popularity?: number;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
    ingredients?: {
        ingredient_id: string;
        quantity: number;
    }[];
}

export const recipeService = {
    /**
     * Get all recipes
     */
    async getRecipes(): Promise<Dish[]> {
        try {
            console.log('Fetching recipes...');

            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return [];
            }

            const { data: recipes, error } = await supabase
                .from('recipes')
                .select(`
          id,
          name,
          description,
          price,
          food_cost,
          category,
          allergens,
          popularity,
          image_url,
          created_at,
          updated_at,
          recipe_ingredients (
            ingredient_id,
            quantity
          )
        `)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching recipes:', error);
                throw error;
            }

            if (!recipes) {
                console.log('No recipes found');
                return [];
            }

            // Transform DB data to our application model
            return recipes.map((recipe: RecipeWithIngredients) => ({
                id: recipe.id,
                name: recipe.name,
                description: recipe.description,
                price: recipe.price,
                foodCost: recipe.food_cost,
                category: recipe.category,
                allergens: recipe.allergens,
                popularity: recipe.popularity,
                imageUrl: recipe.image_url,
                ingredients: recipe.ingredients?.map(item => ({
                    ingredientId: item.ingredient_id,
                    quantity: item.quantity
                })) || [],
                createdAt: recipe.created_at || new Date().toISOString(),
                updatedAt: recipe.updated_at || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Exception in getRecipes:', error);
            return [];
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
          allergens,
          popularity,
          image_url,
          created_at,
          updated_at,
          recipe_ingredients (
            ingredient_id,
            quantity
          )
        `)
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching recipe:', error);
                throw error;
            }

            if (!recipe) return null;

            // Transform DB data to our application model
            return {
                id: recipe.id,
                name: recipe.name,
                description: recipe.description,
                price: recipe.price,
                foodCost: recipe.food_cost,
                category: recipe.category,
                allergens: recipe.allergens,
                popularity: recipe.popularity,
                imageUrl: recipe.image_url,
                ingredients: recipe.recipe_ingredients?.map(item => ({
                    ingredientId: item.ingredient_id,
                    quantity: item.quantity
                })) || [],
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

            // First, insert the recipe
            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .insert({
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    food_cost: dish.foodCost,
                    category: dish.category,
                    allergens: dish.allergens,
                    popularity: dish.popularity,
                    image_url: dish.imageUrl,
                    user_id: user.id // Include the user_id
                })
                .select()
                .single();

            if (recipeError) {
                console.error('Error adding recipe:', recipeError);
                throw recipeError;
            }

            if (!recipe) {
                console.error('Recipe was not created');
                throw new Error('Recipe creation failed');
            }

            console.log('Recipe created with ID:', recipe.id);

            // Then, insert recipe ingredients
            if (dish.ingredients && dish.ingredients.length > 0) {
                const ingredientsToInsert = dish.ingredients.map(ingredient => ({
                    recipe_id: recipe.id,
                    ingredient_id: ingredient.ingredientId,
                    quantity: ingredient.quantity
                }));

                console.log('Inserting ingredients:', ingredientsToInsert);

                const { error: ingredientsError } = await supabase
                    .from('recipe_ingredients')
                    .insert(ingredientsToInsert);

                if (ingredientsError) {
                    console.error('Error adding recipe ingredients:', ingredientsError);
                    // Attempt to delete the recipe since ingredients failed
                    await supabase.from('recipes').delete().eq('id', recipe.id);
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
                allergens: dish.allergens,
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
     * Update an existing recipe
     */
    async updateRecipe(id: string, dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish | null> {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            // First, update the recipe
            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .update({
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    food_cost: dish.foodCost,
                    category: dish.category,
                    allergens: dish.allergens,
                    popularity: dish.popularity,
                    image_url: dish.imageUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', user.id) // Ensure the user owns this recipe
                .select()
                .single();

            if (recipeError) {
                console.error('Error updating recipe:', recipeError);
                throw recipeError;
            }

            if (!recipe) {
                console.error('Recipe not found or not owned by user');
                throw new Error('Recipe update failed');
            }

            // Delete all previous ingredients
            const { error: deleteError } = await supabase
                .from('recipe_ingredients')
                .delete()
                .eq('recipe_id', id);

            if (deleteError) {
                console.error('Error deleting previous ingredients:', deleteError);
                throw deleteError;
            }

            // Then, insert new recipe ingredients
            if (dish.ingredients && dish.ingredients.length > 0) {
                const ingredientsToInsert = dish.ingredients.map(ingredient => ({
                    recipe_id: id,
                    ingredient_id: ingredient.ingredientId,
                    quantity: ingredient.quantity
                }));

                const { error: ingredientsError } = await supabase
                    .from('recipe_ingredients')
                    .insert(ingredientsToInsert);

                if (ingredientsError) {
                    console.error('Error updating recipe ingredients:', ingredientsError);
                    throw ingredientsError;
                }
            }

            // Return the complete dish
            return {
                id: id,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                foodCost: dish.foodCost,
                category: dish.category,
                allergens: dish.allergens,
                popularity: dish.popularity,
                imageUrl: dish.imageUrl,
                ingredients: dish.ingredients || [],
                createdAt: recipe.created_at,
                updatedAt: recipe.updated_at
            };
        } catch (error) {
            // Enhanced error logging
            console.error('Exception in updateRecipe:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error; // Re-throw the error so it's caught by the hook
        }
    },

    /**
     * Delete a recipe
     */
    async deleteRecipe(id: string): Promise<boolean> {
        try {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                throw new Error('User not authenticated');
            }

            // Delete the recipe (cascade should handle ingredients)
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Ensure the user owns this recipe

            if (error) {
                console.error('Error deleting recipe:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Exception in deleteRecipe:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            throw error; // Re-throw the error so it's caught by the hook
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

            // Get ingredient costs from database
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