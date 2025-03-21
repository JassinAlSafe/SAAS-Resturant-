"use client";

import RecipeForm from "@/components/RecipeForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiAlertCircle } from "react-icons/fi";
import { RecipeModalsProps, RecipeModalsHookReturn } from "../../types";
import { motion } from "framer-motion";

export function RecipeModals({
  ingredients,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onArchiveRecipe,
  onBulkDeleteRecipes,
  onBulkArchiveRecipes,
  isProcessing,
  ...props
}: RecipeModalsProps & RecipeModalsHookReturn) {
  const {
    modalType,
    currentRecipe,
    recipesToDelete,
    showArchiveOption,
    showBulkArchiveOption,
    closeModal,
  } = props;

  return (
    <>
      {/* Add Recipe Modal */}
      <Dialog
        open={modalType === "add"}
        onOpenChange={() => modalType === "add" && closeModal()}
      >
        <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-medium text-gray-800">
              Add New Recipe
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Create a new recipe with ingredients and pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="px-0 py-0 max-h-[80vh] overflow-y-auto">
            <RecipeForm
              ingredients={ingredients}
              onSave={onAddRecipe}
              onCancel={closeModal}
              isLoading={isProcessing}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Recipe Modal */}
      <Dialog
        open={modalType === "edit"}
        onOpenChange={() => modalType === "edit" && closeModal()}
      >
        <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-medium text-gray-800">
              Edit Recipe
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Update recipe details, ingredients, or pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="px-0 py-0 max-h-[80vh] overflow-y-auto">
            {currentRecipe && (
              <RecipeForm
                dish={currentRecipe}
                ingredients={ingredients}
                onSave={onEditRecipe}
                onCancel={closeModal}
                isLoading={isProcessing}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Recipe Modal */}
      <Dialog
        open={modalType === "delete"}
        onOpenChange={() => modalType === "delete" && closeModal()}
      >
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-lg shadow-lg border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-medium text-gray-800">
              Delete Recipe
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Are you sure you want to delete this recipe? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          
          {showArchiveOption && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md"
            >
              <div className="flex items-start">
                <FiAlertCircle className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">
                    Cannot Delete Recipe
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    This recipe cannot be deleted because it is referenced in
                    sales records. You can archive it instead, which will hide
                    it from active recipes but preserve the sales history.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={closeModal}
              className="text-sm h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentRecipe && onDeleteRecipe(currentRecipe.id)}
              disabled={showArchiveOption || isProcessing}
              className="text-sm h-9 px-4"
            >
              {isProcessing ? "Processing..." : "Delete"}
            </Button>
            {showArchiveOption && (
              <Button
                variant="default"
                onClick={() =>
                  currentRecipe && onArchiveRecipe(currentRecipe.id)
                }
                disabled={isProcessing}
                className="text-sm h-9 px-4 bg-amber-600 hover:bg-amber-700"
              >
                {isProcessing ? "Processing..." : "Archive Instead"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={modalType === "bulkDelete"}
        onOpenChange={() => modalType === "bulkDelete" && closeModal()}
      >
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-lg shadow-lg border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-medium text-gray-800">
              Delete Multiple Recipes
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Are you sure you want to delete {recipesToDelete.length} recipes?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {showBulkArchiveOption && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md"
            >
              <div className="flex items-start">
                <FiAlertCircle className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">
                    Some Recipes Cannot Be Deleted
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Some of the selected recipes cannot be deleted because they are
                    referenced in sales records. You can archive these recipes
                    instead, which will hide them from active recipes but preserve
                    the sales history.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={closeModal}
              className="text-sm h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onBulkDeleteRecipes}
              disabled={showBulkArchiveOption || isProcessing}
              className="text-sm h-9 px-4"
            >
              {isProcessing ? "Processing..." : "Delete"}
            </Button>
            {showBulkArchiveOption && (
              <Button
                variant="default"
                onClick={onBulkArchiveRecipes}
                disabled={isProcessing}
                className="text-sm h-9 px-4 bg-amber-600 hover:bg-amber-700"
              >
                {isProcessing ? "Processing..." : "Archive Instead"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Ingredients Modal */}
      <Dialog
        open={modalType === "viewIngredients"}
        onOpenChange={() => modalType === "viewIngredients" && closeModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ingredients for {currentRecipe?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto py-4">
            {currentRecipe?.ingredients.length === 0 ? (
              <p className="text-slate-500">
                No ingredients added to this recipe.
              </p>
            ) : (
              <ul className="space-y-2">
                {currentRecipe?.ingredients.map((ingredient) => {
                  const ingredientDetails = ingredients.find(
                    (ing) => ing.id === ingredient.ingredientId
                  );

                  return (
                    <li
                      key={ingredient.ingredientId}
                      className="flex justify-between items-center p-3 rounded-md border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {ingredientDetails?.name || "Unknown Ingredient"}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {ingredient.quantity}{" "}
                        {ingredientDetails?.unit || "units"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
