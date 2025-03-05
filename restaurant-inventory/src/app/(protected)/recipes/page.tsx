"use client";

import { useState } from "react";
import { useRecipes } from "./hooks/useRecipes";
import { useRecipeModals } from "./hooks/useRecipeModals";
import Card from "@/components/Card";
import RecipeHeader from "./components/RecipeHeader";
import RecipeActions from "./components/RecipeActions";
import RecipeSearch from "./components/RecipeSearch";
import RecipeTable from "./components/RecipeTable";
import RecipeLoading from "./components/RecipeLoading";
import EmptyRecipes from "./components/EmptyRecipes";
import { RecipeModals } from "./components/modals";
import RecipeForm from "@/components/RecipeForm";
import { Dish } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FiAlertCircle, FiLoader } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
    refreshData,
  } = useRecipes();

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

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Dish | null>(null);
  const [recipesToDelete, setRecipesToDelete] = useState<Dish[]>([]);

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle deleting a recipe
  const handleDeleteRecipe = async () => {
    if (currentRecipe) {
      await deleteRecipe(currentRecipe.id);
      setShowDeleteModal(false);
      setCurrentRecipe(null);
    }
  };

  // Handle add recipe
  const handleAddRecipe = (recipe: Dish) => {
    addRecipe(recipe);
    setShowAddModal(false);
  };

  // Handle edit recipe
  const handleEditRecipe = (recipe: Dish) => {
    updateRecipe(recipe);
    setShowEditModal(false);
  };

  // Handle bulk delete recipes
  const handleBulkDeleteRecipes = () => {
    if (recipesToDelete.length > 0) {
      Promise.all(recipesToDelete.map((recipe) => deleteRecipe(recipe.id)))
        .then(() => {
          toast.success(
            `${recipesToDelete.length} recipes deleted successfully`
          );
          setShowBulkDeleteModal(false);
          setRecipesToDelete([]);
        })
        .catch((error) => {
          toast.error("Failed to delete recipes");
          console.error(error);
        });
    }
  };

  // Handle duplicate recipe
  const handleDuplicateRecipe = (recipe: Dish) => {
    const duplicatedRecipe: Dish = {
      ...recipe,
      id: `temp-${Date.now()}`,
      name: `${recipe.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRecipe(duplicatedRecipe);
    toast.success(`Recipe "${recipe.name}" duplicated successfully`);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string, recipes: Dish[]) => {
    if (action === "delete") {
      setRecipesToDelete(recipes);
      setShowBulkDeleteModal(true);
    } else if (action === "export") {
      // Create a JSON file with the selected recipes
      const dataStr = JSON.stringify(recipes, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;

      const exportFileDefaultName = `recipes-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success(`${recipes.length} recipes exported successfully`);
    }
  };

  // Handle view ingredients
  const handleViewIngredients = (recipe: Dish) => {
    setCurrentRecipe(recipe);
    // This would typically open a modal or navigate to a details page
    // For now, we'll just log the ingredients
    console.log("Viewing ingredients for", recipe.name, recipe.ingredients);
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
          <RecipeActions onAddClick={() => setShowAddModal(true)} />
        </div>

        <EmptyRecipes onAddClick={() => setShowAddModal(true)} />

        {/* Add Recipe Modal - Using the same modal as in the main view */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <DialogTitle className="text-xl text-gray-800">
                Add New Recipe
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Create a new recipe with ingredients and pricing.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
              <RecipeForm
                ingredients={ingredients}
                onSave={handleAddRecipe}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main view with recipes
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <RecipeHeader />
        <RecipeActions onAddClick={() => setShowAddModal(true)} />
      </div>

      <RecipeSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <Card>
        <RecipeTable
          recipes={filteredRecipes}
          ingredients={ingredients}
          onEditClick={(recipe) => {
            setCurrentRecipe(recipe);
            setShowEditModal(true);
          }}
          onDeleteClick={(recipe) => {
            setCurrentRecipe(recipe);
            setShowDeleteModal(true);
          }}
          onViewIngredientsClick={handleViewIngredients}
          onDuplicateClick={handleDuplicateRecipe}
          onBulkAction={handleBulkAction}
        />
      </Card>

      {/* Add Recipe Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add New Recipe</DialogTitle>
            <DialogDescription>
              Create a new recipe with ingredients and pricing.
            </DialogDescription>
          </DialogHeader>
          <RecipeForm
            ingredients={ingredients}
            onSave={handleAddRecipe}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Recipe Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
            <DialogDescription>
              Update recipe details, ingredients, or pricing.
            </DialogDescription>
          </DialogHeader>
          {currentRecipe && (
            <RecipeForm
              dish={currentRecipe}
              ingredients={ingredients}
              onSave={handleEditRecipe}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Recipe Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="p-0 gap-0 overflow-hidden max-w-md">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <DialogTitle className="text-xl text-gray-800">
              Delete Recipe
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete this recipe? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            {currentRecipe && (
              <div className="flex items-center gap-3 p-3 mb-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <FiAlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-red-800">
                    {currentRecipe.name}
                  </p>
                  <p className="text-sm text-red-600">
                    This recipe will be permanently deleted
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecipe}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent className="p-0 gap-0 overflow-hidden max-w-md">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <DialogTitle className="text-xl text-gray-800">
              Delete Multiple Recipes
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete {recipesToDelete.length} recipes?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-3">
              <div className="flex items-center gap-2 mb-2 text-red-800">
                <FiAlertCircle className="h-4 w-4" />
                <span className="font-medium">Warning: Permanent Deletion</span>
              </div>
              <p className="text-sm text-red-600 mb-0">
                You are about to delete {recipesToDelete.length} recipes. This
                action cannot be reversed.
              </p>
            </div>
            <div className="max-h-[200px] overflow-y-auto my-3 border border-gray-100 rounded-lg p-3 bg-gray-50">
              <ul className="space-y-1">
                {recipesToDelete.map((recipe) => (
                  <li
                    key={recipe.id}
                    className="text-sm text-gray-700 py-1 px-2 border-b border-gray-100 last:border-0"
                  >
                    • {recipe.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteModal(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDeleteRecipes}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {recipesToDelete.length} Recipes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
