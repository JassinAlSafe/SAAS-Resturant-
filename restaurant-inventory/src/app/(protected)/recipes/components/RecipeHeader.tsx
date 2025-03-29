"use client";

import {
  FiPlus,
  FiAlertCircle,
  FiChevronDown,
  FiRefreshCw,
  FiArchive,
  FiList,
  FiDownload,
} from "react-icons/fi";
import { useState } from "react";

interface RecipeHeaderProps {
  recipesCount?: number;
  totalRecipes?: number;
  error?: string;
  onRetry?: () => void;
  retry?: () => void;
  showArchived?: boolean;
  onToggleArchived?: (show: boolean) => void;
  isLoading?: boolean;
  onAddRecipe?: () => void;
}

export default function RecipeHeader({
  recipesCount = 0,
  totalRecipes,
  error,
  onRetry,
  retry,
  showArchived = false,
  onToggleArchived,
  isLoading = false,
  onAddRecipe,
}: RecipeHeaderProps) {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Use either onRetry or retry prop
  const handleRetry = onRetry || retry;

  // Handle dropdown toggle and outside click
  const handleToggleViewDropdown = () => {
    setShowViewDropdown(!showViewDropdown);
    // Close the other dropdown if open
    if (showActionsDropdown) setShowActionsDropdown(false);
  };

  const handleToggleActionsDropdown = () => {
    setShowActionsDropdown(!showActionsDropdown);
    // Close the other dropdown if open
    if (showViewDropdown) setShowViewDropdown(false);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Recipes</h1>
          <p className="text-sm text-neutral-600 mt-1 flex items-center">
            <span>Manage your recipe catalog and view performance metrics</span>
            {isLoading ? (
              <span className="inline-flex items-center ml-2 px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-xs">
                Loading...
              </span>
            ) : (
              (totalRecipes !== undefined || recipesCount > 0) && (
                <span className="inline-flex items-center ml-2 px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-xs">
                  {totalRecipes !== undefined ? totalRecipes : recipesCount}{" "}
                  {(totalRecipes !== undefined
                    ? totalRecipes
                    : recipesCount) === 1
                    ? "recipe"
                    : "recipes"}
                </span>
              )
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:justify-end justify-center">
          {/* View dropdown */}
          <div className="relative">
            <button
              onClick={handleToggleViewDropdown}
              className="px-4 py-2 bg-white border border-neutral-300 rounded-md font-medium flex items-center justify-center hover:bg-neutral-50 text-neutral-700"
            >
              <span className="mr-2 text-neutral-500">
                {showArchived ? <FiArchive size={16} /> : <FiList size={16} />}
              </span>
              {showArchived ? "Archived Recipes" : "Active Recipes"}
              <FiChevronDown className="h-4 w-4 ml-2 text-neutral-400" />
            </button>

            {showViewDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-md border border-neutral-200 z-10 overflow-hidden">
                <button
                  onClick={() => {
                    onToggleArchived?.(false);
                    setShowViewDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center ${
                    !showArchived
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <FiList
                    className={`h-4 w-4 mr-2 ${
                      !showArchived ? "text-neutral-900" : "text-neutral-400"
                    }`}
                  />
                  Active Recipes
                  {!showArchived && (
                    <span className="ml-auto">
                      <span className="bg-neutral-200 w-2 h-2 rounded-full inline-block"></span>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onToggleArchived?.(true);
                    setShowViewDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center ${
                    showArchived
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <FiArchive
                    className={`h-4 w-4 mr-2 ${
                      showArchived ? "text-neutral-900" : "text-neutral-400"
                    }`}
                  />
                  Archived Recipes
                  {showArchived && (
                    <span className="ml-auto">
                      <span className="bg-neutral-200 w-2 h-2 rounded-full inline-block"></span>
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={handleToggleActionsDropdown}
              className="px-4 py-2 bg-white border border-neutral-300 rounded-md font-medium flex items-center justify-center hover:bg-neutral-50 text-neutral-700"
            >
              Actions
              <FiChevronDown className="h-4 w-4 ml-2 text-neutral-400" />
            </button>
            {showActionsDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-md border border-neutral-200 z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setShowActionsDropdown(false);
                    if (onAddRecipe) onAddRecipe();
                  }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center text-neutral-700 hover:bg-neutral-50"
                >
                  <FiPlus className="h-4 w-4 mr-2 text-green-600" />
                  <span>New Recipe</span>
                </button>
                <button
                  onClick={() => setShowActionsDropdown(false)}
                  className="w-full text-left px-4 py-3 text-sm flex items-center text-neutral-700 hover:bg-neutral-50"
                >
                  <FiDownload className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Export Recipes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-md flex items-center gap-3">
          <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm flex-grow">{error}</span>
          {handleRetry && (
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 bg-white text-red-600 text-sm font-medium rounded-md border border-red-200 hover:bg-red-50 transition-colors flex items-center"
            >
              <FiRefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
