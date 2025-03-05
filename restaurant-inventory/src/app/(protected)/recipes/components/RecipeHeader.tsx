"use client";

import { ApiError } from "@/components/ui/api-error";
import { FiBook, FiInfo } from "react-icons/fi";

interface RecipeHeaderProps {
  error?: string;
  retry?: () => void;
}

export default function RecipeHeader({ error, retry }: RecipeHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="bg-blue-50 p-2 rounded-lg">
          <FiBook className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Recipe Management
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            Create and manage recipes for your restaurant
            <span className="inline-flex items-center ml-3 text-blue-600 text-xs font-medium">
              <FiInfo className="h-3 w-3 mr-1" />
              Pro tip: Add ingredients to calculate food costs
            </span>
          </p>
        </div>
      </div>

      {error && retry && (
        <ApiError title="Recipe Data Error" message={error} onRetry={retry} />
      )}
    </div>
  );
}
