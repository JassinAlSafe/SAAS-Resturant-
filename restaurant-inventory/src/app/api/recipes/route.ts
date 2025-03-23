import { NextResponse } from 'next/server';
import { Recipe } from '@/app/(protected)/sales/types';
import { supabaseServer } from '@/lib/supabase-server';

interface IngredientDetail {
    id: string;
    name: string;
    unit: string;
}

// Add cache configuration to prevent excessive refetching
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
    try {
        // For server API routes, we need to rely on server-side authorization
        // Since this is a mock API for the MVP, we\'ll return mock data if needed
        // In a production app, we would properly check authorization and fetch real data

        // Try to fetch real data first
        try {
            // Fetch from recipes table without user filter
            const { data: recipesData, error: recipesError } = await supabaseServer
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
                    recipe_ingredients (
                        ingredient_id,
                        quantity
                    )
                `)
                .eq('is_archived', false)
                .limit(10); // Limit to avoid excessive data

            if (!recipesError && recipesData && recipesData.length > 0) {
                // Process the actual DB data

                // Fetch all ingredient details for these recipes
                const ingredientIds = new Set<string>();
                recipesData.forEach(recipe => {
                    recipe.recipe_ingredients?.forEach(item => {
                        ingredientIds.add(item.ingredient_id);
                    });
                });

                let ingredientDetails: Record<string, IngredientDetail> = {};
                if (ingredientIds.size > 0) {
                    const { data: ingredients, error: ingredientsError } = await supabaseServer
                        .from('ingredients')
                        .select('id, name, unit')
                        .in('id', Array.from(ingredientIds));

                    if (!ingredientsError && ingredients) {
                        ingredientDetails = ingredients.reduce<Record<string, IngredientDetail>>((acc, ing) => {
                            acc[ing.id] = ing;
                            return acc;
                        }, {});
                    }
                }

                // Transform recipes data to Recipe interface
                const recipes: Recipe[] = recipesData.map(recipe => ({
                    id: recipe.id,
                    name: recipe.name,
                    price: recipe.price || 0,
                    category: recipe.category || undefined,
                    description: recipe.description || undefined,
                    image: recipe.image_url || undefined,
                    ingredients: recipe.recipe_ingredients?.map(item => {
                        const ingredient = ingredientDetails[item.ingredient_id];
                        return {
                            ingredientId: item.ingredient_id,
                            quantity: item.quantity,
                            name: ingredient ? ingredient.name : 'Unknown Ingredient'
                        };
                    }) || []
                }));

                return NextResponse.json(recipes, {
                    headers: {
                        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                    }
                });
            }
        } catch (dbError) {
            console.warn('Could not fetch from database, using mock data:', dbError);
        }

        // Fallback to mock data
        const mockRecipes: Recipe[] = [
            {
                id: "recipe1",
                name: "Chicken Alfredo",
                price: 14.99,
                category: "Pasta",
                description: "Creamy alfredo sauce with grilled chicken over fettuccine pasta",
                image: "/images/chicken-alfredo.jpg",
                ingredients: [
                    { ingredientId: "ing1", quantity: 200, name: "Fettuccine Pasta" },
                    { ingredientId: "ing2", quantity: 150, name: "Chicken Breast" },
                    { ingredientId: "ing3", quantity: 100, name: "Heavy Cream" },
                ]
            },
            {
                id: "recipe2",
                name: "Margherita Pizza",
                price: 12.99,
                category: "Pizza",
                description: "Classic pizza with tomato sauce, fresh mozzarella, and basil",
                image: "/images/margherita-pizza.jpg",
                ingredients: [
                    { ingredientId: "ing4", quantity: 250, name: "Pizza Dough" },
                    { ingredientId: "ing5", quantity: 100, name: "Tomato Sauce" },
                    { ingredientId: "ing6", quantity: 150, name: "Mozzarella" },
                ]
            },
            {
                id: "recipe3",
                name: "Caesar Salad",
                price: 8.99,
                category: "Salad",
                description: "Romaine lettuce with parmesan, croutons and caesar dressing",
                image: "/images/caesar-salad.jpg",
                ingredients: [
                    { ingredientId: "ing7", quantity: 200, name: "Romaine Lettuce" },
                    { ingredientId: "ing8", quantity: 50, name: "Parmesan Cheese" },
                    { ingredientId: "ing9", quantity: 30, name: "Croutons" },
                ]
            }
        ];

        // Add cache headers to the mock data response as well
        return NextResponse.json(mockRecipes, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
            }
        });
    } catch (error) {
        console.error('Error in recipes API:', error);
        return NextResponse.json({ error: 'Internal server error' }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
            }
        });
    }
}