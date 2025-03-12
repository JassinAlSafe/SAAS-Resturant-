"use client";

import { useState, useEffect } from "react";
import { useRecipes } from "./hooks/useRecipes";
import { useRecipeModals } from "./hooks/useRecipeModals";
import RecipeHeader from "./components/RecipeHeader";
import RecipeTable from "./components/RecipeTable";
import RecipeSearch from "./components/RecipeSearch";
import RecipeLoading from "./components/RecipeLoading";
import EmptyRecipes from "./components/EmptyRecipes";
import RecipeActions from "./components/RecipeActions";
import { RecipeModals } from "./components/modals/RecipeModals";
import RecipeFilterDialog from "./components/modals/RecipeFilterDialog";
import { Dish } from "@/lib/types";
import { toast } from "sonner";

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

  // Use recipe modals hook
  const recipeModals = useRecipeModals();

  // State for search and processing status
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Add state for filter dialog and criteria
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    categories: [],
    allergens: [],
  });

  // Effect to refetch recipes when archive state changes
  useEffect(() => {
    fetchRecipesAndIngredients();
  }, [showArchivedRecipes]);

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
      (recipe.allergens &&
        filterCriteria.allergens.every((allergen) =>
          recipe.allergens?.includes(allergen)
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
      await fetchRecipesAndIngredients(); // Refetch after adding
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
      await fetchRecipesAndIngredients(); // Refetch after editing
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
      await fetchRecipesAndIngredients(); // Refetch after unarchiving
      toast.success("Recipe unarchived successfully");
    } catch (error) {
      console.error("Error unarchiving recipe:", error);
      toast.error("Failed to unarchive recipe");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle filter dialog
  const handleFilterClick = () => {
    setIsFilterDialogOpen(true);
  };

  const handleFilterApply = (criteria: FilterCriteria) => {
    setFilterCriteria(criteria);
    const hasActiveFilters =
      criteria.categories.length > 0 ||
      criteria.allergens.length > 0 ||
      criteria.minPrice !== undefined ||
      criteria.maxPrice !== undefined ||
      criteria.minFoodCost !== undefined ||
      criteria.maxFoodCost !== undefined;

    if (hasActiveFilters) {
      toast.success("Filters applied successfully");
    }
  };

  // Update the category filter click handler
  const handleCategoryFilterClick = () => {
    setIsFilterDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return <RecipeLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="w-full py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <RecipeHeader
            error={error || ""}
            retry={fetchRecipesAndIngredients}
            totalRecipes={recipes.length}
            showArchivedRecipes={showArchivedRecipes}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (recipes.length === 0) {
    return (
      <div className="w-full py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <RecipeHeader
            totalRecipes={0}
            showArchivedRecipes={showArchivedRecipes}
          />
          <RecipeActions
            onAddClick={recipeModals.openAddModal}
            onCategoryFilterClick={handleCategoryFilterClick}
            recipes={filteredRecipes}
          />
        </div>

        <EmptyRecipes onAddClick={recipeModals.openAddModal} />

        {/* Recipe modals */}
        <RecipeModals
          ingredients={ingredients}
          onAddRecipe={handleAddRecipe}
          onEditRecipe={handleEditRecipe}
          onDeleteRecipe={handleDeleteRecipe}
          onArchiveRecipe={handleArchiveRecipe}
          onBulkDeleteRecipes={() => {}}
          onBulkArchiveRecipes={() => {}}
          isProcessing={isProcessing}
          {...recipeModals}
        />
      </div>
    );
  }

  // Main view with recipes
  return (
    <div className="w-full py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <RecipeHeader
          totalRecipes={recipes.length}
          error={error || ""}
          retry={fetchRecipesAndIngredients}
          showArchivedRecipes={showArchivedRecipes}
        />
        <RecipeActions
          onAddClick={recipeModals.openAddModal}
          onCategoryFilterClick={handleCategoryFilterClick}
          recipes={filteredRecipes}
        />
      </div>

      <RecipeSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showArchivedRecipes={showArchivedRecipes}
        onToggleArchivedRecipes={handleToggleArchivedRecipes}
        onFilterClick={handleFilterClick}
      />

      <RecipeTable
        recipes={filteredRecipes}
        showArchivedRecipes={showArchivedRecipes}
        onEdit={recipeModals.openEditModal}
        onDelete={recipeModals.openDeleteModal}
        onDuplicate={(recipe) => {
          const duplicate = {
            ...recipe,
            id: crypto.randomUUID(),
            name: `${recipe.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          handleAddRecipe(duplicate);
        }}
        onArchive={(recipe) =>
          recipe.isArchived
            ? handleUnarchiveRecipe(recipe)
            : handleArchiveRecipe(recipe.id)
        }
      />

      {/* Recipe modals */}
      <RecipeModals
        ingredients={ingredients}
        onAddRecipe={handleAddRecipe}
        onEditRecipe={handleEditRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onArchiveRecipe={handleArchiveRecipe}
        onBulkDeleteRecipes={() => {}}
        onBulkArchiveRecipes={() => {}}
        isProcessing={isProcessing}
        {...recipeModals}
      />

      {/* Filter dialog */}
      <RecipeFilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        recipes={recipes}
        onFilter={handleFilterApply}
      />
    </div>
  );
}
