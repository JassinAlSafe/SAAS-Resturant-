"use client";

import { FC, useEffect, useState, useCallback } from "react";
import RecipeHeader from "./components/RecipeHeader";
import RecipeTableNew from "./components/RecipeTableNew";
import { FilterCriteria, RecipeModalType } from "./types";
import { Dish } from "@/lib/types";
import { useRecipes } from "./hooks/useRecipes";
import RecipeFilterDialog from "./components/modals/RecipeFilterDialog";
import RecipeSearch from "./components/RecipeSearch";
import RecipeAddModal from "./components/modals/RecipeAddModal";
import RecipeEditModal from "./components/modals/RecipeEditModal";
import RecipeDeleteModal from "./components/modals/RecipeDeleteModal";
import RecipeArchiveModal from "./components/modals/RecipeArchiveModal";
import RecipeDetailModal from "./components/modals/RecipeDetailModal";
import { toast } from "sonner";

const RecipesPage: FC = () => {
  const { recipes, isLoading, isError, refetch } = useRecipes();

  const [filteredRecipes, setFilteredRecipes] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    categories: [],
    allergens: [],
  });
  const [showArchivedRecipes, setShowArchivedRecipes] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Dish | null>(null);
  const [modalType, setModalType] = useState<RecipeModalType | null>(null);

  // Modal disclosure hooks
  const addModal = useDisclosure(false);
  const editModal = useDisclosure(false);
  const deleteModal = useDisclosure(false);
  const archiveModal = useDisclosure(false);
  const detailModal = useDisclosure(false);
  const filterModal = useDisclosure(false);

  // Handle add/edit/delete/archive actions
  const handleAddRecipe = () => {
    setModalType("add");
    addModal.open();
  };

  const handleEditRecipe = (recipe: Dish) => {
    setCurrentRecipe(recipe);
    setModalType("edit");
    editModal.open();
  };

  const handleDeleteRecipe = (recipe: Dish) => {
    setCurrentRecipe(recipe);
    setModalType("delete");
    deleteModal.open();
  };

  const handleArchiveRecipe = (recipe: Dish) => {
    setCurrentRecipe(recipe);
    setModalType("archive");
    archiveModal.open();
  };

  const handleViewRecipe = (recipe: Dish) => {
    setCurrentRecipe(recipe);
    setModalType("view");
    detailModal.open();
  };

  // Apply filters to recipes
  const applyFilters = useCallback(() => {
    console.log("Applying filters to", recipes.length, "recipes");

    // Analyze recipe-dish relationships (safely checking for dish_id property)
    const recipesWithDishes = recipes.filter(
      (recipe) => "dish_id" in recipe && recipe.dish_id != null
    );
    const recipesWithoutDishes = recipes.filter(
      (recipe) => !("dish_id" in recipe) || recipe.dish_id == null
    );

    console.log(`Recipe-Dish Relationship Analysis:
    - Total Recipes: ${recipes.length}
    - With Dish relationship: ${recipesWithDishes.length}
    - Without Dish relationship: ${recipesWithoutDishes.length}`);

    let results = [...recipes];

    // Filter by archived status
    results = results.filter((recipe) => {
      // Safeguard against undefined isArchived values
      const isArchived = recipe.isArchived ?? false;
      return showArchivedRecipes ? isArchived : !isArchived;
    });

    console.log("After archived filtering:", results.length, "recipes remain");

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.category?.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query)
      );

      console.log("After search filtering:", results.length, "recipes remain");
    }

    // Apply category filter
    if (filterCriteria.categories && filterCriteria.categories.length > 0) {
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

    setFilteredRecipes(results);
  }, [recipes, searchQuery, filterCriteria, showArchivedRecipes]);

  // Update filters when recipes change
  useEffect(() => {
    applyFilters();
  }, [recipes, searchQuery, filterCriteria, showArchivedRecipes, applyFilters]);

  // Return handler after recipe operation
  const handleRecipeChange = useCallback(() => {
    console.log("handleRecipeChange called - refreshing recipes");

    // Try to use the refetch function if available
    if (typeof refetch === "function") {
      try {
        console.log("Using refetch function to refresh recipes");
        refetch();

        // Force update of filtered recipes after a short delay
        setTimeout(() => {
          applyFilters();
          console.log("Applied filters after delay");
        }, 500);
      } catch (error) {
        console.error("Error refetching recipes:", error);
        toast.error("Failed to refresh recipe list");

        // Force a manual re-filter as fallback
        applyFilters();
      }
    } else {
      console.warn("refetch is not a function, using fallback refresh method");
      // Force a list update by just refreshing the filtered list
      applyFilters();
      toast.success("Recipe added successfully");
    }
  }, [refetch, applyFilters]);

  // Handle modal close events
  const handleCloseModal = () => {
    setCurrentRecipe(null);
    setModalType(null);
  };

  // Return the component JSX
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <RecipeHeader
        recipeCount={filteredRecipes.length}
        onAddRecipe={handleAddRecipe}
        showArchived={showArchivedRecipes}
        setShowArchived={setShowArchivedRecipes}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />

      <RecipeSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilter={() => filterModal.open()}
        filterCriteria={filterCriteria}
      />

      <RecipeTableNew
        recipes={filteredRecipes}
        isLoading={isLoading}
        onAction={(recipe, action) => {
          if (action === "view") handleViewRecipe(recipe);
          if (action === "edit") handleEditRecipe(recipe);
          if (action === "delete") handleDeleteRecipe(recipe);
          if (action === "archive") handleArchiveRecipe(recipe);
        }}
        showArchived={showArchivedRecipes}
        onUnarchive={async () => await refetch()}
      />

      {/* Modals */}
      {recipes.length > 0 && (
        <RecipeFilterDialog
          isOpen={filterModal.isOpen}
          onClose={filterModal.close}
          recipes={recipes}
          onFilter={setFilterCriteria}
        />
      )}

      {modalType === "add" && (
        <RecipeAddModal
          isOpen={addModal.isOpen}
          onClose={() => {
            console.log("RecipeAddModal closing...");
            addModal.close();
            handleCloseModal();
            // Explicitly refresh recipes when modal closes
            if (typeof refetch === "function") {
              console.log("Explicit refetch on modal close");
              refetch().catch((err) =>
                console.error("Error in explicit refetch:", err)
              );
            }
          }}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalType === "edit" && currentRecipe && (
        <RecipeEditModal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.close();
            handleCloseModal();
          }}
          recipe={currentRecipe}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalType === "delete" && currentRecipe && (
        <RecipeDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => {
            deleteModal.close();
            handleCloseModal();
          }}
          recipe={currentRecipe}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalType === "archive" && currentRecipe && (
        <RecipeArchiveModal
          isOpen={archiveModal.isOpen}
          onClose={() => {
            archiveModal.close();
            handleCloseModal();
          }}
          recipe={currentRecipe}
          isArchiving={!currentRecipe.isArchived}
          onSuccess={handleRecipeChange}
        />
      )}

      {modalType === "view" && currentRecipe && (
        <RecipeDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => {
            detailModal.close();
            handleCloseModal();
          }}
          recipe={currentRecipe}
        />
      )}
    </div>
  );
};

// Create local useDisclosure hook
function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}

export default RecipesPage;
