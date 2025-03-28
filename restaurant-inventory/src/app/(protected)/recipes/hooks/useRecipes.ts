"use client";

import { useState, useEffect, useCallback } from "react";
import { Dish } from "@/lib/types";
import { recipeService } from "@/lib/services/recipe-service";
import { toast } from "sonner";

// Helper function to log archive status
function logArchiveStats(recipes: Dish[], context: string) {
    const archived = recipes.filter(r => Boolean(r.isArchived) === true).length;
    const active = recipes.filter(r => !Boolean(r.isArchived)).length;
    console.log(`[useRecipes:${context}] Archive stats: ${archived} archived, ${active} active (total: ${recipes.length})`);
}

export function useRecipes() {
    // State for recipes and loading status
    const [recipes, setRecipes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState<number>(0);
    const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

    // Fetch both active and archived recipes to avoid needing to refetch
    // when toggling between views
    const fetchRecipes = useCallback(async (showToast = false) => {
        try {
            const startTime = Date.now();
            console.log(`[useRecipes] Fetching ALL recipes - starting at ${new Date(startTime).toISOString()}`);
            console.log(`[useRecipes] Last refresh was ${(startTime - lastRefreshTime) / 1000} seconds ago`);

            setIsLoading(true);
            setIsError(false);

            // Important: Fetch ALL recipes - both active and archived - to avoid having to refetch 
            // when toggling between views. We'll filter in the component.
            const data = await recipeService.getRecipes(true); // true = include archived

            console.log(`[useRecipes] Fetched ${data.length} total recipes at ${new Date().toISOString()}`);

            // Enhanced logging for debugging archive status
            const archivedCount = data.filter(r => Boolean(r.isArchived)).length;
            const activeCount = data.filter(r => !Boolean(r.isArchived)).length;
            console.log(`[useRecipes] Active recipes: ${activeCount}, Archived: ${archivedCount}, Total: ${data.length}`);

            // Show details of first few recipes for debugging
            if (data.length > 0) {
                console.log("[useRecipes] First few recipes archive status:",
                    data.slice(0, Math.min(5, data.length)).map(r => ({
                        id: r.id.substring(0, 8),
                        name: r.name,
                        isArchived: r.isArchived,
                        isArchivedType: typeof r.isArchived
                    }))
                );
            }

            // Update the last refresh time
            setLastRefreshTime(startTime);

            // Validate the returned data
            if (!Array.isArray(data)) {
                console.error("[useRecipes] Invalid data format returned from recipe service:", data);
                throw new Error("Invalid response format from server");
            }

            // Mark archived recipes clearly - ensure consistent boolean values
            const processedData = data.map(recipe => ({
                ...recipe,
                isArchived: Boolean(recipe.isArchived) // Ensure boolean type
            }));

            // Log archive stats after processing
            logArchiveStats(processedData, "afterProcessing");

            // Clear state first
            setRecipes([]);

            // Set recipes state with a delay to ensure full re-render
            setTimeout(() => {
                setRecipes(processedData);
                console.log(`[useRecipes] Recipes state updated with ${processedData.length} items`);
                logArchiveStats(processedData, "afterStateUpdate");
            }, 50);

            if (showToast) {
                toast.success("Recipes refreshed successfully");
            }

            return processedData;
        } catch (error) {
            console.error("[useRecipes] Error fetching recipes:", error);
            setIsError(true);

            if (showToast) {
                toast.error("Failed to refresh recipes. Please try again.");
            }

            // Return empty array instead of stale state
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [lastRefreshTime]);

    // Initial fetch on mount and when refresh counter changes
    useEffect(() => {
        console.log(`[useRecipes] Running useEffect - refresh counter: ${refreshCounter}`);
        fetchRecipes();
    }, [fetchRecipes, refreshCounter]);

    // Force refresh function - guaranteed to fetch fresh data
    const forceRefresh = useCallback(async () => {
        console.log("[useRecipes] Force refreshing recipes - incrementing counter");

        // Increment the refresh counter to trigger a refresh via useEffect
        setRefreshCounter(prev => {
            const newValue = prev + 1;
            console.log(`[useRecipes] Refresh counter incrementing from ${prev} to ${newValue}`);
            return newValue;
        });

        // Give a small delay before fetching to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));

        // Also trigger an immediate fetch with toast
        const result = await fetchRecipes(true);

        // Verify state was updated correctly
        console.log(`[useRecipes] After force refresh - state has ${recipes.length} recipes, fetched ${result.length}`);
        logArchiveStats(result, "afterForceRefresh");

        return result;
    }, [fetchRecipes, recipes.length]);

    // Return state and functions
    return {
        recipes,
        isLoading,
        isError,
        refetch: forceRefresh,
    };
} 