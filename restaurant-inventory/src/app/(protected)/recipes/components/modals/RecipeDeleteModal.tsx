"use client";

import { FiX, FiTrash2 } from "react-icons/fi";
import { Dish } from "@/lib/types";

interface RecipeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Dish;
  onDelete: () => void;
}

export default function RecipeDeleteModal({
  isOpen,
  onClose,
  recipe,
  onDelete,
}: RecipeDeleteModalProps) {
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
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
