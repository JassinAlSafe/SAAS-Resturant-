"use client";

import { useState, useCallback } from "react";
import { FiX, FiArchive, FiRefreshCw } from "react-icons/fi";
import { Dish } from "@/lib/types";
import { recipeService } from "@/lib/services/recipe-service";
import { toast } from "sonner";

interface RecipeArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Dish;
  isArchiving: boolean;
  onSuccess: () => Promise<void>;
}

export default function RecipeArchiveModal({
  isOpen,
  onClose,
  recipe,
  isArchiving = true,
  onSuccess,
}: RecipeArchiveModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleArchiveToggle = useCallback(async () => {
    if (!recipe || !recipe.id) {
      toast.error("Invalid recipe data");
      return;
    }

    setIsProcessing(true);
    const actionName = isArchiving ? "Archiving" : "Unarchiving";
    const toastId = toast.loading(`${actionName} recipe...`);

    try {
      console.log(
        `Attempting to ${actionName.toLowerCase()} recipe: ${recipe.id} - ${
          recipe.name
        }`
      );

      // Call the appropriate service method
      let success = false;
      if (isArchiving) {
        success = await recipeService.archiveRecipe(recipe.id);
      } else {
        success = await recipeService.unarchiveRecipe(recipe.id);
      }

      console.log(`${actionName} operation result:`, success);

      if (success) {
        toast.dismiss(toastId);
        toast.success(
          `Recipe ${isArchiving ? "archived" : "restored"} successfully`
        );

        // Call onSuccess first to trigger refresh
        await onSuccess();

        // Then close the modal
        onClose();
      } else {
        throw new Error(`Failed to ${actionName.toLowerCase()} recipe`);
      }
    } catch (error) {
      console.error(`Error ${actionName.toLowerCase()} recipe:`, error);
      toast.dismiss(toastId);
      toast.error(
        `Failed to ${actionName.toLowerCase()} recipe. Please try again.`
      );
    } finally {
      setIsProcessing(false);
    }
  }, [recipe, onClose, onSuccess, isArchiving]);

  if (!isOpen) return null;

  const title = isArchiving ? "Archive Recipe" : "Restore Recipe";
  const subtitle = isArchiving
    ? "Hide recipe from active menu"
    : "Make recipe active again";
  const buttonText = isArchiving ? "Archive Recipe" : "Restore Recipe";
  const IconComponent = isArchiving ? FiArchive : FiRefreshCw;
  const iconBgColor = isArchiving ? "bg-amber-50" : "bg-green-50";
  const iconColor = isArchiving ? "text-amber-500" : "text-green-500";
  const buttonBgColor = isArchiving
    ? isProcessing
      ? "bg-amber-400"
      : "bg-amber-600 hover:bg-amber-700"
    : isProcessing
    ? "bg-green-400"
    : "bg-green-600 hover:bg-green-700";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-lg w-full flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${iconBgColor} p-2.5 rounded-md`}>
              <IconComponent className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                {title}
              </h3>
              <p className="text-neutral-500 text-sm mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-500"
            disabled={isProcessing}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-4">
            <p className="text-neutral-800">
              Are you sure you want to {isArchiving ? "archive" : "restore"}{" "}
              <span className="font-medium">{recipe.name}</span>?
            </p>
            <p className="text-neutral-500 text-sm mt-2">
              {isArchiving
                ? "This will hide the recipe from your active menu, but you can restore it later."
                : "This will make the recipe visible in your active menu again."}
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-md mt-4">
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Note:</span>{" "}
              {isArchiving
                ? "Archiving is recommended for recipes that are no longer offered but are still referenced in past sales."
                : "Restoring a recipe will make it available in your active menu again."}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleArchiveToggle}
            disabled={isProcessing}
            className={`px-4 py-2 ${buttonBgColor} text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center`}
          >
            {isProcessing ? (
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
                {isArchiving ? "Archiving..." : "Restoring..."}
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
