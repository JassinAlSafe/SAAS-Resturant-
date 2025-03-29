"use client";

import { FiPlus, FiBook, FiUpload } from "react-icons/fi";

interface EmptyRecipesProps {
  onAddRecipe: () => void;
  onImportClick?: () => void;
  showArchivedRecipes?: boolean;
}

export default function EmptyRecipes({
  onAddRecipe,
  onImportClick,
  showArchivedRecipes = false,
}: EmptyRecipesProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-neutral-100 shadow-sm">
      <div className="bg-orange-50 p-8 rounded-full mb-8 relative">
        <FiBook className="h-14 w-14 text-orange-500" />
      </div>

      <h2 className="text-2xl font-semibold mb-3 text-neutral-900">
        {showArchivedRecipes
          ? "No Archived Recipes"
          : "Your Recipe Book is Empty"}
      </h2>

      <p className="text-neutral-600 mb-8 max-w-md">
        {showArchivedRecipes
          ? "You don't have any archived recipes. When you archive recipes, they'll appear here."
          : "Start creating your restaurant's menu by adding recipes. Track ingredients, costs, and pricing to optimize your menu profitability."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {!showArchivedRecipes && (
          <button
            onClick={onAddRecipe}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            Create First Recipe
          </button>
        )}
        {onImportClick && !showArchivedRecipes && (
          <button
            onClick={onImportClick}
            className="px-6 py-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <FiUpload className="mr-2 h-5 w-5" />
            Import Recipes
          </button>
        )}
      </div>

      {!showArchivedRecipes && (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">
              Track Ingredients
            </h3>
            <p className="text-sm text-neutral-600">
              Manage ingredients and their costs for accurate food cost
              calculations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">
              Optimize Pricing
            </h3>
            <p className="text-sm text-neutral-600">
              Set optimal prices based on food costs to maximize profitability
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">
              Manage Menu
            </h3>
            <p className="text-sm text-neutral-600">
              Organize recipes by categories and track allergen information
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
