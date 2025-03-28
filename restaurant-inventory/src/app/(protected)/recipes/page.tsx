"use client";

import { FC, useState, useCallback, useMemo, useEffect } from "react";
import RecipeHeader from "./components/RecipeHeader";
import RecipeTableNew from "./components/RecipeTableNew";
import { FilterCriteria, RecipeModalType } from "./types";
import { Dish } from "@/lib/types";
import { useRecipes } from "./hooks/useRecipes";
import { recipeService } from "@/lib/services/recipe-service";
import RecipeFilterDialog from "./components/modals/RecipeFilterDialog";
import RecipeSearch from "./components/RecipeSearch";
import RecipeAddModal from "./components/modals/RecipeAddModal";
import RecipeEditModal from "./components/modals/RecipeEditModal";
import RecipeDeleteModal from "./components/modals/RecipeDeleteModal";
import RecipeArchiveModal from "./components/modals/RecipeArchiveModal";
import RecipeDetailModal from "./components/modals/RecipeDetailModal";
import { toast } from "sonner";

/* Additional debug logging to understand recipe archived status */
function logRecipeArchiveStatus(recipes: Dish[]): void {
  const archivedRecipes = recipes.filter((r) => Boolean(r.isArchived) === true);
  const activeRecipes = recipes.filter((r) => Boolean(r.isArchived) !== true);

  console.log(`[DEBUG] Total recipes: ${recipes.length}`);
  console.log(`[DEBUG] Active recipes: ${activeRecipes.length}`);
  console.log(`[DEBUG] Archived recipes: ${archivedRecipes.length}`);

  if (archivedRecipes.length > 0) {
    console.log(`[DEBUG] First archived recipe:`, {
      id: archivedRecipes[0].id,
      name: archivedRecipes[0].name,
      isArchived: archivedRecipes[0].isArchived,
    });
  }

  if (activeRecipes.length > 0) {
    console.log(`[DEBUG] First active recipe:`, {
      id: activeRecipes[0].id,
      name: activeRecipes[0].name,
      isArchived: activeRecipes[0].isArchived,
    });
  }
}

interface ModalState {
  type: RecipeModalType | null;
  recipe: Dish | null;
  isOpen: boolean;
}

const RecipesPage: FC = () => {
  const { recipes, isLoading, isError, refetch } = useRecipes();

  // Add debug logging when recipes change
  useEffect(() => {
    if (recipes.length > 0) {
      logRecipeArchiveStatus(recipes);
    }
  }, [recipes]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    categories: [],
    allergens: [],
  });
  const [showArchivedRecipes, setShowArchivedRecipes] = useState(false);

  // Consolidated modal state
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    recipe: null,
    isOpen: false,
  });

  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Apply filters to recipes - memoized to avoid recalculation
  const filteredRecipes = useMemo(() => {
    if (!recipes.length) return [];

    let results = [...recipes];

    // First, filter by archived status - ensure we're properly comparing boolean values
    results = results.filter((recipe) => {
      if (showArchivedRecipes) {
        // Only return recipes with isArchived=true
        return Boolean(recipe.isArchived) === true;
      } else {
        // Only return recipes with isArchived=false or undefined/null
        return !Boolean(recipe.isArchived);
      }
    });

    // Add debug logging to help troubleshoot
    console.log(
      `Filtering recipes: ${recipes.length} total, ${
        results.length
      } after archive filter (showing ${
        showArchivedRecipes ? "archived" : "active"
      })`
    );
    console.log(
      `Archive status of first few recipes:`,
      recipes
        .slice(0, 3)
        .map((r) => ({ id: r.id, name: r.name, isArchived: r.isArchived }))
    );

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          (recipe.category || "").toLowerCase().includes(query) ||
          (recipe.description || "").toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterCriteria.categories?.length) {
      results = results.filter((recipe) =>
        filterCriteria.categories?.includes(recipe.category || "")
      );
    }

    // Apply price range filter
    if (filterCriteria.minPrice !== undefined) {
      results = results.filter(
        (recipe) => recipe.price >= (filterCriteria.minPrice || 0)
      );
    }

    if (filterCriteria.maxPrice !== undefined) {
      results = results.filter(
        (recipe) => recipe.price <= (filterCriteria.maxPrice || 999999)
      );
    }

    return results;
  }, [recipes, searchQuery, filterCriteria, showArchivedRecipes]);

  // Modal handlers - consolidated into a single function
  const openModal = useCallback(
    (type: RecipeModalType, recipe: Dish | null = null) => {
      setModalState({
        type,
        recipe,
        isOpen: true,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));

    // Reset modal state after animation completes
    setTimeout(() => {
      setModalState({
        type: null,
        recipe: null,
        isOpen: false,
      });
    }, 300);
  }, []);

  // Action handlers
  const handleAddRecipe = () => openModal("add");
  const handleEditRecipe = (recipe: Dish) => openModal("edit", recipe);
  const handleDeleteRecipe = (recipe: Dish) => openModal("delete", recipe);
  const handleArchiveRecipe = (recipe: Dish) => openModal("archive", recipe);
  const handleViewRecipe = (recipe: Dish) => openModal("view", recipe);

  // After recipe change, refresh data
  const handleRecipeChange = useCallback(async (): Promise<void> => {
    console.log("[handleRecipeChange] Recipe change detected, refreshing data");

    try {
      // Always refetch data after recipe operations
      if (typeof refetch === "function") {
        // Use await to ensure refetch completes
        const refreshedRecipes = await refetch();
        console.log(
          `[handleRecipeChange] Recipe list refreshed successfully with ${refreshedRecipes.length} recipes`
        );

        // Log the archive status of the refreshed recipes
        logRecipeArchiveStatus(refreshedRecipes);
      } else {
        console.warn("[handleRecipeChange] refetch function not available");
      }
    } catch (error) {
      console.error("[handleRecipeChange] Error refreshing recipes:", error);
      toast.error(
        "Failed to refresh recipe list. The change was saved, but you may need to reload the page to see updates."
      );
    }
  }, [refetch]);

  // Handle recipe actions from table
  const handleRecipeAction = useCallback((recipe: Dish, action: string) => {
    switch (action) {
      case "view":
        handleViewRecipe(recipe);
        break;
      case "edit":
        handleEditRecipe(recipe);
        break;
      case "delete":
        handleDeleteRecipe(recipe);
        break;
      case "archive":
        handleArchiveRecipe(recipe);
        break;
    }
  }, []);

  // Handle unarchiving a recipe
  const handleUnarchive = useCallback(
    async (id: string): Promise<void> => {
      console.log(`[handleUnarchive] Unarchiving recipe with id: ${id}`);
      try {
        // Call the recipe service directly to unarchive
        const success = await recipeService.unarchiveRecipe(id);
        if (success) {
          toast.success("Recipe restored successfully");
          // Then trigger a refresh
          if (typeof refetch === "function") {
            const newRecipes = await refetch();
            console.log(
              `[handleUnarchive] Recipe list refreshed with ${newRecipes.length} recipes after unarchive`
            );

            // If we don't have any archived recipes left, switch back to active view
            const archivedRecipes = newRecipes.filter(
              (r) => Boolean(r.isArchived) === true
            );
            if (archivedRecipes.length === 0 && showArchivedRecipes) {
              console.log(
                "[handleUnarchive] No archived recipes left, switching to active view"
              );
              setShowArchivedRecipes(false);
            }
          }
        } else {
          toast.error("Failed to restore recipe");
        }
      } catch (error) {
        console.error("[handleUnarchive] Error unarchiving recipe:", error);
        toast.error("Failed to restore recipe");
      }
    },
    [refetch, showArchivedRecipes]
  );

  // Improve the onToggleArchived function to force refresh when switching views
  const handleToggleArchivedView = useCallback(() => {
    setShowArchivedRecipes((prev) => {
      const newValue = !prev;
      console.log(
        `[handleToggleArchivedView] Toggling archive view from ${prev} to ${newValue}`
      );
      return newValue;
    });

    // Also trigger a refresh when toggling views
    setTimeout(() => {
      if (typeof refetch === "function") {
        refetch().then((newRecipes) => {
          console.log(
            `[handleToggleArchivedView] Refreshed recipes: ${newRecipes.length} total`
          );
          logRecipeArchiveStatus(newRecipes);
        });
      }
    }, 100);
  }, [refetch]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <RecipeHeader
        recipesCount={filteredRecipes.length}
        onAddRecipe={handleAddRecipe}
        showArchived={showArchivedRecipes}
        onToggleArchived={handleToggleArchivedView}
        isLoading={isLoading}
        error={isError ? "Failed to load recipes" : ""}
        onRetry={async () => {
          try {
            await refetch();
            return Promise.resolve();
          } catch (error) {
            console.error("Error refreshing:", error);
            return Promise.reject(error);
          }
        }}
      />

      <RecipeSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilter={() => setIsFilterDialogOpen(true)}
      />

      <RecipeTableNew
        recipes={filteredRecipes}
        isLoading={isLoading}
        onAction={handleRecipeAction}
        showArchived={showArchivedRecipes}
        onUnarchive={handleUnarchive}
      />

      {/* Modals */}
      {recipes.length > 0 && (
        <RecipeFilterDialog
          isOpen={isFilterDialogOpen}
          onClose={() => setIsFilterDialogOpen(false)}
          recipes={recipes}
          onFilter={setFilterCriteria}
        />
      )}

      {modalState.type === "add" && (
        <RecipeAddModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalState.type === "edit" && modalState.recipe && (
        <RecipeEditModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          recipe={modalState.recipe}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalState.type === "delete" && modalState.recipe && (
        <RecipeDeleteModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          recipe={modalState.recipe}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalState.type === "archive" && modalState.recipe && (
        <RecipeArchiveModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          recipe={modalState.recipe}
          isArchiving={!modalState.recipe.isArchived}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalState.type === "view" && modalState.recipe && (
        <RecipeDetailModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          recipe={modalState.recipe}
        />
      )}
    </div>
  );
};

export default RecipesPage;
