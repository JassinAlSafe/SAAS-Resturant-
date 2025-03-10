"use client";

import { ApiError } from "@/components/ui/api-error";
import { FiBook, FiInfo, FiArchive } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface RecipeHeaderProps {
  error?: string;
  retry?: () => void;
  showArchivedRecipes?: boolean;
  onToggleArchivedRecipes?: (show: boolean) => void;
}

export default function RecipeHeader({
  error,
  retry,
  showArchivedRecipes = false,
  onToggleArchivedRecipes,
}: RecipeHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <FiBook className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {showArchivedRecipes ? "Archived Recipes" : "Recipe Management"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              {showArchivedRecipes
                ? "View and manage your archived recipes"
                : "Create and manage recipes for your restaurant"}
              <span className="inline-flex items-center ml-3 text-blue-600 text-xs font-medium">
                <FiInfo className="h-3 w-3 mr-1" />
                Pro tip: Add ingredients to calculate food costs
              </span>
            </p>
          </div>
        </div>

        {onToggleArchivedRecipes && (
          <Button
            variant={showArchivedRecipes ? "default" : "outline"}
            onClick={() => onToggleArchivedRecipes(!showArchivedRecipes)}
            className="flex items-center gap-2"
          >
            <FiArchive className="h-4 w-4" />
            {showArchivedRecipes ? "View Active Recipes" : "View Archived"}
          </Button>
        )}
      </div>

      {error && retry && (
        <ApiError title="Recipe Data Error" message={error} onRetry={retry} />
      )}
    </div>
  );
}
