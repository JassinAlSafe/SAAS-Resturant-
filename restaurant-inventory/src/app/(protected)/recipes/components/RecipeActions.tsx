"use client";

import { FiPlus } from "react-icons/fi";

interface RecipeActionsProps {
  onAddRecipe: () => void;
  showArchivedRecipes?: boolean;
}

export default function RecipeActions({
  onAddRecipe,
  showArchivedRecipes = false,
}: RecipeActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {!showArchivedRecipes && (
        <button
          onClick={onAddRecipe}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm"
        >
          <FiPlus className="h-4 w-4 mr-2" />
          Add Recipe
        </button>
      )}
    </div>
  );
}
