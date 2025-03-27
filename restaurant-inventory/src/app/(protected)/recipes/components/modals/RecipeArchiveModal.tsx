"use client";

import { FiX, FiArchive } from "react-icons/fi";
import { Dish } from "@/lib/types";

interface RecipeArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Dish;
  onArchive: () => void;
}

export default function RecipeArchiveModal({
  isOpen,
  onClose,
  recipe,
  onArchive,
}: RecipeArchiveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-lg w-full flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2.5 rounded-md">
              <FiArchive className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Archive Recipe
              </h3>
              <p className="text-neutral-500 text-sm mt-0.5">
                Hide recipe from active menu
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
              Are you sure you want to archive{" "}
              <span className="font-medium">{recipe.name}</span>?
            </p>
            <p className="text-neutral-500 text-sm mt-2">
              This will hide the recipe from your active menu, but you can
              restore it later.
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-md mt-4">
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Note:</span> Archiving is
              recommended for recipes that are no longer offered but are still
              referenced in past sales.
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
            onClick={onArchive}
            className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Archive Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
