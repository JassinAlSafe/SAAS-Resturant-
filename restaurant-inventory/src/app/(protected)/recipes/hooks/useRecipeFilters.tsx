"use client";

import { useState, useMemo } from "react";
import { Dish } from "@/lib/types";

export function useRecipeFilters(recipes: Dish[]) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered recipes based on search term
  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) {
      return recipes; // Return all recipes if no search term
    }

    const lowercaseSearch = searchTerm.toLowerCase();

    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(lowercaseSearch)
    );
  }, [recipes, searchTerm]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredRecipes,
    resetFilters,
  };
}
