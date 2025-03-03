"use client";

import { useState, useEffect } from "react";
import { Dish, Ingredient } from "@/lib/types";
import { recipeService } from "@/lib/services/recipe-service";
import { inventoryService } from "@/lib/services/inventory-service";
import { useNotificationHelpers } from "@/lib/notification-context";

export function useRecipes() {
  // State
  const [recipes, setRecipes] = useState<Dish[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notifications
  const { success, error: showError } = useNotificationHelpers();

  // Fetch recipes and ingredients
  const fetchRecipesAndIngredients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch recipes
      const fetchedRecipes = await recipeService.getRecipes();
      setRecipes(fetchedRecipes);

      // Fetch ingredients
      const fetchedIngredients = await inventoryService.getItems();
      setIngredients(fetchedIngredients);
    } catch (err) {
      console.error("Error fetching recipes and ingredients:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to load recipes and ingredients. ${errorMessage}`);
      showError(
        "Failed to load data",
        "There was an error loading recipes and ingredients."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new recipe
  const addRecipe = async (
    recipe: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newRecipe = await recipeService.addRecipe(recipe);

      if (newRecipe) {
        setRecipes((prev) => [...prev, newRecipe]);
        success(
          "Recipe Added",
          `${newRecipe.name} has been added to your recipes.`
        );
        return newRecipe;
      }

      return null;
    } catch (err) {
      console.error("Error adding recipe:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showError(
        "Failed to add recipe",
        `There was an error adding the recipe: ${errorMessage}`
      );
      return null;
    }
  };

  // Update a recipe
  const updateRecipe = async (
    id: string,
    recipeData: Omit<Dish, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const updatedRecipe = await recipeService.updateRecipe(id, recipeData);

      if (updatedRecipe) {
        setRecipes((prev) =>
          prev.map((recipe) => (recipe.id === id ? updatedRecipe : recipe))
        );
        success("Recipe Updated", `${updatedRecipe.name} has been updated.`);
        return updatedRecipe;
      }

      return null;
    } catch (err) {
      console.error("Error updating recipe:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showError(
        "Failed to update recipe",
        `There was an error updating the recipe: ${errorMessage}`
      );
      return null;
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id: string) => {
    try {
      await recipeService.deleteRecipe(id);

      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
      success(
        "Recipe Deleted",
        "The recipe has been deleted from your collection."
      );
      return true;
    } catch (err) {
      console.error("Error deleting recipe:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showError(
        "Failed to delete recipe",
        `There was an error deleting the recipe: ${errorMessage}`
      );
      return false;
    }
  };

  // Calculate the cost of a recipe based on its ingredients
  const calculateRecipeCost = async (recipeIngredients = []) => {
    try {
      const cost = await recipeService.calculateRecipeCost(recipeIngredients);
      return cost;
    } catch (err) {
      console.error("Error calculating recipe cost:", err);
      return 0;
    }
  };

  // Get ingredient details by ID
  const getIngredientById = (id: string) => {
    return ingredients.find((ingredient) => ingredient.id === id);
  };

  // Load data on initial render
  useEffect(() => {
    fetchRecipesAndIngredients();
  }, []);

  return {
    recipes,
    ingredients,
    isLoading,
    error,
    fetchRecipesAndIngredients,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    calculateRecipeCost,
    getIngredientById,
  };
}
