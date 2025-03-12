"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSearch, FiFilter, FiArchive } from "react-icons/fi";

interface RecipeSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showArchivedRecipes?: boolean;
  onToggleArchivedRecipes?: (show: boolean) => void;
  onFilterClick?: () => void;
}

export default function RecipeSearch({
  searchQuery,
  onSearchChange,
  showArchivedRecipes = false,
  onToggleArchivedRecipes,
  onFilterClick,
}: RecipeSearchProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recipes by name, category, or ingredients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 border-gray-200 bg-gray-50/50 focus-visible:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {onToggleArchivedRecipes && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 whitespace-nowrap"
              onClick={() => onToggleArchivedRecipes(!showArchivedRecipes)}
            >
              <FiArchive className="h-4 w-4 mr-2" />
              {showArchivedRecipes ? "Show Active" : "Show Archived"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 whitespace-nowrap"
            onClick={onFilterClick}
          >
            <FiFilter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
