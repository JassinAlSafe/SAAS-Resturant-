"use client";

import { useState, useEffect } from "react";
import { useRecipes } from "./hooks/useRecipes";
import Card from "@/components/Card";
import RecipeHeader from "./components/RecipeHeader";
import RecipeActions from "./components/RecipeActions";
import RecipeSearch from "./components/RecipeSearch";
import RecipeTable from "./components/RecipeTable";
import RecipeLoading from "./components/RecipeLoading";
import EmptyRecipes from "./components/EmptyRecipes";
import RecipeForm from "@/components/RecipeForm";
import { Dish } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FiAlertCircle } from "react-icons/fi";
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
    showArchivedRecipes,
    setShowArchivedRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    archiveRecipe,
    unarchiveRecipe,
    fetchRecipesAndIngredients,
  } = useRecipes();

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Dish | null>(null);
  const [recipesToDelete, setRecipesToDelete] = useState<Dish[]>([]);
  const [showArchiveOption, setShowArchiveOption] = useState(false);
  const [showBulkArchiveOption, setShowBulkArchiveOption] = useState(false);

  // Effect to refetch recipes when archive state changes
  useEffect(() => {
    fetchRecipesAndIngredients();
  }, [showArchivedRecipes]);

  // Filter recipes based on search query and archive status
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesArchiveState = showArchivedRecipes
      ? recipe.isArchived
      : !recipe.isArchived;
    return matchesSearch && matchesArchiveState;
  });

  // Handle toggling archived recipes view
  const handleToggleArchivedRecipes = (show: boolean) => {
    setShowArchivedRecipes(show);
    setSearchQuery(""); // Clear search when switching views
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async () => {
    if (!currentRecipe || !currentRecipe.id) {
      toast.error("No recipe selected for deletion");
      setShowDeleteModal(false);
      return;
    }

    const result = await deleteRecipe(currentRecipe.id);

    if (result.success) {
      setShowDeleteModal(false);
      setCurrentRecipe(null);
      setShowArchiveOption(false);
    } else if (result.hasSalesReferences) {
      setShowArchiveOption(true);
      toast.error("Cannot delete recipe", {
        description:
          "This recipe has associated sales records. You can archive it instead to hide it from active recipes.",
        duration: 5000,
      });
    } else {
      toast.error(`Failed to delete recipe: ${result.error}`);
    }
  };

  // Handle archiving a recipe
  const handleArchiveRecipe = async () => {
    if (!currentRecipe || !currentRecipe.id) {
      toast.error("No recipe selected for archiving");
      return;
    }

    try {
      const success = await archiveRecipe(currentRecipe.id);
      if (success) {
        setShowDeleteModal(false);
        setCurrentRecipe(null);
        setShowArchiveOption(false);
      }
    } catch (error) {
      console.error("Error in handleArchiveRecipe:", error);
    }
  };

  // Handle add recipe
  const handleAddRecipe = (recipe: Dish) => {
    addRecipe(recipe);
    setShowAddModal(false);
  };

  // Handle edit recipe
  const handleEditRecipe = (recipe: Dish) => {
    const { id, ...recipeData } = recipe;
    updateRecipe(id, recipeData);
    setShowEditModal(false);
  };

  // Handle bulk delete recipes
  const handleBulkDeleteRecipes = async () => {
    if (!recipesToDelete.length) {
      toast.error("No recipes selected for deletion");
      return;
    }

    try {
      const results = await Promise.all(
        recipesToDelete.map((recipe) => deleteRecipe(recipe.id))
      );

      const successful = results.filter((result) => result.success).length;
      const failed = results.length - successful;
      const hasSalesReferences = results.some(
        (result) => result.hasSalesReferences
      );

      if (successful > 0) {
        toast.success(
          `Successfully deleted ${successful} recipe${
            successful !== 1 ? "s" : ""
          }.`
        );
      }

      if (failed > 0) {
        if (hasSalesReferences) {
          setShowBulkArchiveOption(true);
          toast.error(
            `${failed} recipe${
              failed !== 1 ? "s" : ""
            } cannot be deleted due to sales records`,
            {
              description:
                "Some recipes are referenced in sales records. You can archive them instead to hide them from active recipes.",
              duration: 5000,
            }
          );
        } else {
          toast.error(
            `Failed to delete ${failed} recipe${failed !== 1 ? "s" : ""}.`
          );
        }
      }

      // Only close the modal if all operations were successful
      if (failed === 0) {
        setRecipesToDelete([]);
        setShowBulkDeleteModal(false);
        setShowBulkArchiveOption(false);
      }
    } catch (error) {
      console.error("Error in handleBulkDeleteRecipes:", error);
      toast.error("There was an error processing your request.");
      setShowBulkArchiveOption(true);
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
    // Filter out archived recipes for deletion
    const activeRecipes = recipes.filter((recipe) => !recipe.isArchived);

    if (action === "delete") {
      if (activeRecipes.length === 0) {
        toast.error("No active recipes selected for deletion");
        return;
      }
      setRecipesToDelete(activeRecipes);
      setShowBulkDeleteModal(true);
    } else if (action === "export") {
      // For export, we can include all selected recipes
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

  // Handle bulk archive recipes
  const handleBulkArchiveRecipes = () => {
    if (!recipesToDelete.length) {
      toast.error("No recipes selected for archiving");
      return;
    }

    try {
      Promise.all(recipesToDelete.map((recipe) => archiveRecipe(recipe.id)))
        .then((results) => {
          const successCount = results.filter(Boolean).length;
          const failCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(
              `Successfully archived ${successCount} recipe${
                successCount !== 1 ? "s" : ""
              }.`
            );
          }

          if (failCount > 0) {
            toast.error(
              `Failed to archive ${failCount} recipe${
                failCount !== 1 ? "s" : ""
              }.`
            );
          }

          setRecipesToDelete([]);
          setShowBulkDeleteModal(false);
        })
        .catch((error) => {
          console.error("Error in bulk archive:", error);
          toast.error("There was an error archiving the selected recipes.");
        });
    } catch (error) {
      console.error("Error in handleBulkArchiveRecipes:", error);
      toast.error("There was an error processing your request.");
    }
  };

  // Handle unarchive recipe
  const handleUnarchiveRecipe = (recipe: Dish) => {
    if (!recipe.id) {
      toast.error("Invalid recipe");
      return;
    }
    unarchiveRecipe(recipe.id);
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
        <div className="p-6">
          <RecipeHeader
            error={error || undefined}
            retry={fetchRecipesAndIngredients}
            showArchivedRecipes={showArchivedRecipes}
            onToggleArchivedRecipes={handleToggleArchivedRecipes}
          />
        </div>
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
          onUnarchiveClick={handleUnarchiveRecipe}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setShowArchiveOption(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecipe}
              disabled={showArchiveOption}
            >
              Delete
            </Button>
            {showArchiveOption && (
              <Button variant="default" onClick={handleArchiveRecipe}>
                Archive Instead
              </Button>
            )}
          </DialogFooter>
          {showArchiveOption && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <FiAlertCircle className="text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">
                    Cannot Delete Recipe
                  </h4>
                  <p className="text-sm text-amber-700">
                    This recipe cannot be deleted because it is referenced in
                    sales records. You can archive it instead, which will hide
                    it from active recipes but preserve the sales history.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Recipes</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {recipesToDelete.length} recipes?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkDeleteModal(false);
                setShowBulkArchiveOption(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDeleteRecipes}
              disabled={showBulkArchiveOption}
            >
              Delete
            </Button>
            {showBulkArchiveOption && (
              <Button variant="default" onClick={handleBulkArchiveRecipes}>
                Archive Instead
              </Button>
            )}
          </DialogFooter>
          {showBulkArchiveOption && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <FiAlertCircle className="text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">
                    Cannot Delete Recipes
                  </h4>
                  <p className="text-sm text-amber-700">
                    Some or all of these recipes cannot be deleted because they
                    are referenced in sales records. You can archive them
                    instead, which will hide them from active recipes but
                    preserve the sales history.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
