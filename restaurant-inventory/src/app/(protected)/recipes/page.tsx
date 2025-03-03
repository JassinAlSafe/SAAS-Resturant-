"use client";

import { useRecipes } from "./hooks/useRecipes";
import { useRecipeFilters } from "./hooks/useRecipeFilters";
import { useRecipeModals } from "./hooks/useRecipeModals";
import Card from "@/components/Card";

import RecipeHeader from "./components/RecipeHeader";
import RecipeActions from "./components/RecipeActions";
import RecipeSearch from "./components/RecipeSearch";
import RecipeTable from "./components/RecipeTable";
import RecipeLoading from "./components/RecipeLoading";
import EmptyRecipes from "./components/EmptyRecipes";
import { RecipeModals } from "./components/modals";

export default function RecipesPage() {
  // Use our custom hooks
  const {
    recipes,
    ingredients,
    isLoading,
    error,
    fetchRecipesAndIngredients,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  } = useRecipes();

  const { searchTerm, setSearchTerm, filteredRecipes } =
    useRecipeFilters(recipes);

  const {
    isFormOpen,
    selectedRecipe,
    isDeleteDialogOpen,
    recipeToDelete,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    closeFormModal,
    closeDeleteDialog,
  } = useRecipeModals();

  // Handle deleting a recipe
  const handleDeleteRecipe = async () => {
    if (recipeToDelete) {
      await deleteRecipe(recipeToDelete.id);
      closeDeleteDialog();
    }
  };

  // Loading state
  if (isLoading) {
    return <RecipeLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <RecipeHeader error={error} retry={fetchRecipesAndIngredients} />
        </div>
      </div>
    );
  }

  // Empty state
  if (recipes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <RecipeHeader />
          <RecipeActions onAddClick={openAddModal} />
        </div>

        <EmptyRecipes onAddClick={openAddModal} />

        <RecipeModals
          isFormOpen={isFormOpen}
          selectedRecipe={selectedRecipe}
          isDeleteDialogOpen={isDeleteDialogOpen}
          recipeToDelete={recipeToDelete}
          ingredients={ingredients}
          onCloseForm={closeFormModal}
          onCloseDeleteDialog={closeDeleteDialog}
          onSaveRecipe={addRecipe}
          onUpdateRecipe={updateRecipe}
          onDeleteRecipe={handleDeleteRecipe}
        />
      </div>
    );
  }

  // Main view with recipes
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <RecipeHeader />
        <RecipeActions onAddClick={openAddModal} />
      </div>

      <RecipeSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <Card>
        <RecipeTable
          recipes={filteredRecipes}
          onEditClick={openEditModal}
          onDeleteClick={openDeleteDialog}
        />
      </Card>

      <RecipeModals
        isFormOpen={isFormOpen}
        selectedRecipe={selectedRecipe}
        isDeleteDialogOpen={isDeleteDialogOpen}
        recipeToDelete={recipeToDelete}
        ingredients={ingredients}
        onCloseForm={closeFormModal}
        onCloseDeleteDialog={closeDeleteDialog}
        onSaveRecipe={addRecipe}
        onUpdateRecipe={updateRecipe}
        onDeleteRecipe={handleDeleteRecipe}
      />
    </div>
  );
}
