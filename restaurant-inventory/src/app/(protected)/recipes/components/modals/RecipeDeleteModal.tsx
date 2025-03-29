"use client";

import { useState, useCallback } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import { Dish } from "@/lib/types";
import { recipeService } from "@/lib/services/recipe-service";
import { toast } from "sonner";

interface RecipeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Dish;
  onSuccess: () => Promise<void>;
}

export default function RecipeDeleteModal({
  isOpen,
  onClose,
  recipe,
  onSuccess,
}: RecipeDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!recipe || !recipe.id) {
      toast.error("Invalid recipe data");
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading("Deleting recipe...");

    try {
      console.log(`Attempting to delete recipe: ${recipe.id} - ${recipe.name}`);

      // Call the service to delete the recipe
      const result = await recipeService.deleteRecipe(recipe.id);

      console.log("Delete operation result:", result);

      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Recipe deleted successfully");

        // Call onSuccess first to trigger refresh
        await onSuccess();

        // Then close the modal
        onClose();
      } else if (result.hasSalesReferences) {
        toast.dismiss(toastId);
        toast.error(
          "Cannot delete: Recipe has sales references. Consider archiving instead."
        );
      } else {
        throw new Error("Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.dismiss(toastId);
      toast.error("Failed to delete recipe. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [recipe, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-lg w-full flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2.5 rounded-md">
              <FiTrash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Delete Recipe
              </h3>
              <p className="text-neutral-500 text-sm mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-500"
            disabled={isDeleting}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-4">
            <p className="text-neutral-800">
              Are you sure you want to delete{" "}
              <span className="font-medium">{recipe.name}</span>?
            </p>
            <p className="text-neutral-500 text-sm mt-2">
              This will permanently remove the recipe from your menu.
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-md mt-4">
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Note:</span> If this recipe is
              linked to past sales, consider archiving it instead to maintain
              your sales records.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 ${
              isDeleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
            } text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center`}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete Recipe"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
