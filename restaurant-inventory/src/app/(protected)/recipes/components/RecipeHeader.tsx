"use client";

import { FiAlertCircle, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { useState } from "react";

interface RecipeHeaderProps {
  recipesCount?: number;
  totalRecipes?: number;
  error?: string;
  onRetry?: () => void;
  retry?: () => void;
  showArchivedRecipes?: boolean;
  onToggleArchivedRecipes?: (show: boolean) => void;
}

export default function RecipeHeader({
  recipesCount = 0,
  totalRecipes,
  error,
  onRetry,
  retry,
  showArchivedRecipes = false,
  onToggleArchivedRecipes,
}: RecipeHeaderProps) {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Use either onRetry or retry prop
  const handleRetry = onRetry || retry;

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Recipes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your recipe catalog and view performance metrics
            {(totalRecipes !== undefined || recipesCount > 0) && (
              <span className="ml-1">
                • {totalRecipes !== undefined ? totalRecipes : recipesCount}{" "}
                {(totalRecipes !== undefined ? totalRecipes : recipesCount) ===
                1
                  ? "recipe"
                  : "recipes"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 flex items-center justify-center transition-colors duration-200"
            >
              {showArchivedRecipes ? "Archived Recipes" : "Active Recipes"}
              <FiChevronDown className="h-4 w-4 ml-2 text-neutral-400" />
            </button>

            {showViewDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-neutral-100 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onToggleArchivedRecipes?.(false);
                      setShowViewDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      !showArchivedRecipes
                        ? "bg-orange-50 text-orange-600 font-medium"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Active Recipes
                  </button>
                  <button
                    onClick={() => {
                      onToggleArchivedRecipes?.(true);
                      setShowViewDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      showArchivedRecipes
                        ? "bg-orange-50 text-orange-600 font-medium"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Archived Recipes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActionsDropdown(!showActionsDropdown)}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 flex items-center justify-center transition-colors duration-200"
            >
              Actions
              <FiChevronDown className="h-4 w-4 ml-2 text-neutral-400" />
            </button>
            {showActionsDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-neutral-100 z-10">
                <div className="py-1">
                  <button
                    onClick={() => setShowActionsDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => setShowActionsDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setShowActionsDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    Bulk edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
          <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
          {handleRetry && (
            <button
              onClick={handleRetry}
              className="ml-auto px-3 py-1 bg-white text-red-600 text-sm font-medium rounded-md border border-red-200 hover:bg-red-50 transition-colors duration-200 flex items-center"
            >
              <FiRefreshCw className="h-3.5 w-3.5 mr-1" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
