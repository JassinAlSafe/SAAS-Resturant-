"use client";

import { useState, useEffect, useCallback } from "react";
import { Dish } from "@/lib/types";
import { recipeService } from "@/lib/services/recipe-service";
import { toast } from "sonner";

export function useRecipes() {
    // State for recipes and loading status
    const [recipes, setRecipes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState<number>(0);

    // Fetch recipes using the recipe service with improved error handling
    const fetchRecipes = useCallback(async (showToast = false) => {
        try {
            console.log("Fetching recipes - starting at", new Date().toISOString());
            setIsLoading(true);
            setIsError(false);

            // Use the recipe service to get recipes
            const data = await recipeService.getRecipes(false); // false = don't include archived

            console.log("Fetched recipes:", data.length, "recipes found at", new Date().toISOString());

            // Validate the returned data
            if (!Array.isArray(data)) {
                console.error("Invalid data format returned from recipe service:", data);
                throw new Error("Invalid response format from server");
            }

            // Log details of each recipe for debugging
            if (data.length > 0) {
                console.log("First recipe details:", {
                    id: data[0].id,
                    name: data[0].name,
                    hasIngredients: data[0].ingredients?.length > 0 || false
                });
            }

            setRecipes(data);

            if (showToast) {
                toast.success("Recipes refreshed successfully");
            }

            return data;
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setIsError(true);

            if (showToast) {
                toast.error("Failed to refresh recipes. Please try again.");
            }

            return recipes; // Return current state in case of error
        } finally {
            setIsLoading(false);
        }
    }, [recipes]);

    // Initial fetch on mount and when refresh counter changes
    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes, refreshCounter]);

    // Force refresh function with debounce protection
    const forceRefresh = useCallback(() => {
        // Increment the refresh counter to trigger a refresh via useEffect
        console.log("Force refreshing recipes list");
        setRefreshCounter(prev => prev + 1);

        // Also trigger an immediate fetch with toast
        return fetchRecipes(true);
    }, [fetchRecipes]);

    // Return state and functions
    return {
        recipes,
        isLoading,
        isError,
        refetch: forceRefresh,
    };
} 