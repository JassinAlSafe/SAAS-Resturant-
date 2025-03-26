"use client";

import { useState, useEffect, useCallback } from "react";
import { useRecipes } from "./hooks/useRecipes";
import { useRecipeModals } from "./hooks/useRecipeModals";
import RecipeHeader from "./components/RecipeHeader";
import RecipeTableNew from "./components/RecipeTableNew";
import RecipeSearch from "./components/RecipeSearch";
import RecipeLoading from "./components/RecipeLoading";
import EmptyRecipes from "./components/EmptyRecipes";
import RecipeActions from "./components/RecipeActions";
import { RecipeModals } from "./components/modals/RecipeModals";
import RecipeFilterDialog from "./components/modals/RecipeFilterDialog";
import { Dish } from "@/lib/types";
import { toast } from "sonner";
import { FiSearch } from "react-icons/fi";

interface FilterCriteria {
  categories: string[];
  allergens: string[];
  minPrice?: number;
  maxPrice?: number;
  minFoodCost?: number;
  maxFoodCost?: number;
}

export default function RecipesPage() {
  // Use our custom hooks
  const {
    recipes,
    ingredients,
    isLoading,
    error,
    showArchivedRecipes,
    setShowArchivedRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    archiveRecipe,
    unarchiveRecipe,
    fetchRecipesAndIngredients,
  } = useRecipes();

  // Memoize the fetch function to prevent infinite loops
  const fetchRecipesAndIngredientsMemoized = useCallback(() => {
    fetchRecipesAndIngredients();
  }, [fetchRecipesAndIngredients]);

  // Use recipe modals hook
  const recipeModals = useRecipeModals();

  // State for search and processing status
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // State for filter dialog and criteria
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    categories: [],
    allergens: [],
  });

  // Effect to refetch recipes when archive state changes
  useEffect(() => {
    fetchRecipesAndIngredientsMemoized();
  }, [showArchivedRecipes, fetchRecipesAndIngredientsMemoized]);

  // Update the filter recipes function to include all criteria
  const filteredRecipes = recipes.filter((recipe) => {
    // Search query filter
    const matchesSearch =
      !searchQuery ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Archive status filter
    const matchesArchiveState = showArchivedRecipes
      ? recipe.isArchived
      : !recipe.isArchived;

    // Category filter
    const matchesCategory =
      filterCriteria.categories.length === 0 ||
      (recipe.category && filterCriteria.categories.includes(recipe.category));

    // Allergen filter
    const matchesAllergens =
      filterCriteria.allergens.length === 0 ||
      (recipe.allergies &&
        filterCriteria.allergens.every((allergen) =>
          recipe.allergies?.includes(allergen)
        ));

    // Price range filter
    const matchesPrice =
      (!filterCriteria.minPrice || recipe.price >= filterCriteria.minPrice) &&
      (!filterCriteria.maxPrice || recipe.price <= filterCriteria.maxPrice);

    // Food cost range filter
    const matchesFoodCost =
      (!filterCriteria.minFoodCost ||
        (recipe.foodCost && recipe.foodCost >= filterCriteria.minFoodCost)) &&
      (!filterCriteria.maxFoodCost ||
        (recipe.foodCost && recipe.foodCost <= filterCriteria.maxFoodCost));

    return (
      matchesSearch &&
      matchesArchiveState &&
      matchesCategory &&
      matchesAllergens &&
      matchesPrice &&
      matchesFoodCost
    );
  });

  // Sort the filtered recipes based on name
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  // Handle toggling archived recipes view
  const handleToggleArchivedRecipes = (show: boolean) => {
    setShowArchivedRecipes(show);
    setSearchQuery(""); // Clear search when switching views
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async (recipeId: string) => {
    setIsProcessing(true);
    try {
      const result = await deleteRecipe(recipeId);

      if (result.success) {
        recipeModals.closeModal();
        toast.success("Recipe deleted successfully");
      } else if (result.hasSalesReferences) {
        recipeModals.setArchiveOption(true);
        toast.error("Cannot delete recipe", {
          description:
            "This recipe has associated sales records. You can archive it instead to hide it from active recipes.",
          duration: 5000,
        });
      } else {
        toast.error(`Failed to delete recipe: ${result.error}`);
      }
    } catch (error) {
      console.error("Error in handleDeleteRecipe:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle archiving a recipe
  const handleArchiveRecipe = async (recipeId: string) => {
    setIsProcessing(true);
    try {
      const success = await archiveRecipe(recipeId);
      if (success) {
        recipeModals.closeModal();
        toast.success("Recipe archived successfully");
      } else {
        toast.error("Failed to archive recipe");
      }
    } catch (error) {
      console.error("Error in handleArchiveRecipe:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle add recipe
  const handleAddRecipe = async (recipe: Dish) => {
    setIsProcessing(true);
    try {
      await addRecipe(recipe);
      recipeModals.closeModal();
      await fetchRecipesAndIngredientsMemoized(); // Refetch after adding
      toast.success("Recipe added successfully");
    } catch (error) {
      console.error("Error in handleAddRecipe:", error);
      toast.error("Failed to add recipe");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle edit recipe
  const handleEditRecipe = async (recipe: Dish) => {
    setIsProcessing(true);
    try {
      const { id, ...recipeData } = recipe;
      await updateRecipe(id, recipeData);
      recipeModals.closeModal();
      await fetchRecipesAndIngredientsMemoized(); // Refetch after editing
      toast.success("Recipe updated successfully");
    } catch (error) {
      console.error("Error in handleEditRecipe:", error);
      toast.error("Failed to update recipe");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle unarchive recipe
  const handleUnarchiveRecipe = async (recipe: Dish) => {
    if (!recipe.id) {
      toast.error("Invalid recipe");
      return;
    }
    setIsProcessing(true);
    try {
      await unarchiveRecipe(recipe.id);
      await fetchRecipesAndIngredientsMemoized(); // Refetch after unarchiving
      toast.success("Recipe unarchived successfully");
    } catch (error) {
      console.error("Error unarchiving recipe:", error);
      toast.error("Failed to unarchive recipe");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle filter dialog open
  const handleFilterClick = () => {
    setIsFilterDialogOpen(true);
  };

  // Handle filter apply
  const handleFilterApply = (criteria: FilterCriteria) => {
    setFilterCriteria(criteria);
    setIsFilterDialogOpen(false);
  };

  // Handle filter clear
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterCriteria({
      categories: [],
      allergens: [],
    });
  };

  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <RecipeHeader
        recipesCount={sortedRecipes.length}
        totalRecipes={sortedRecipes.length}
        error={error}
        onRetry={fetchRecipesAndIngredientsMemoized}
        showArchivedRecipes={showArchivedRecipes}
        onToggleArchivedRecipes={handleToggleArchivedRecipes}
      />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <RecipeSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterClick={handleFilterClick}
            filterActive={
              filterCriteria.categories.length > 0 ||
              filterCriteria.allergens.length > 0 ||
              filterCriteria.minPrice !== undefined ||
              filterCriteria.maxPrice !== undefined ||
              filterCriteria.minFoodCost !== undefined ||
              filterCriteria.maxFoodCost !== undefined
            }
          />
          <RecipeActions
            showArchivedRecipes={showArchivedRecipes}
            onAddRecipe={recipeModals.openAddModal}
          />
        </div>
      </div>

      {isLoading ? (
        <RecipeLoading />
      ) : recipes.length === 0 ? (
        <EmptyRecipes
          showArchivedRecipes={showArchivedRecipes}
          onAddRecipe={recipeModals.openAddModal}
        />
      ) : sortedRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <FiSearch className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No recipes found
          </h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            {showArchivedRecipes
              ? "No archived recipes match your search criteria."
              : "No recipes match your search criteria."}
          </p>
          <button
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <RecipeTableNew
          recipes={sortedRecipes}
          showArchivedRecipes={showArchivedRecipes}
          onEdit={recipeModals.openEditModal}
          onDelete={recipeModals.openDeleteModal}
          onArchive={handleUnarchiveRecipe}
          onRowClick={recipeModals.openViewIngredientsModal}
        />
      )}

      {/* Recipe Modals */}
      <RecipeModals
        ingredients={ingredients}
        isProcessing={isProcessing}
        onAddRecipe={handleAddRecipe}
        onEditRecipe={handleEditRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onArchiveRecipe={handleArchiveRecipe}
        onBulkDeleteRecipes={() => console.log("Bulk delete not implemented")}
        onBulkArchiveRecipes={() => console.log("Bulk archive not implemented")}
        {...recipeModals}
      />

      {/* Filter Dialog */}
      <RecipeFilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onFilter={handleFilterApply}
        recipes={recipes}
      />
    </div>
  );
}
