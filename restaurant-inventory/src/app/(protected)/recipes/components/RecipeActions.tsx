"use client";

import { Button } from "@/components/ui/button";
import { CurrencySelector } from "@/components/currency-selector";
import {
  FiPlus,
  FiDownload,
  FiUpload,
  FiFilter,
  FiSettings,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dish } from "@/lib/types";
import { toast } from "sonner";

interface RecipeActionsProps {
  onAddClick: () => void;
  onCategoryFilterClick?: () => void;
  recipes?: Dish[];
}

export default function RecipeActions({
  onAddClick,
  onCategoryFilterClick,
  recipes = [],
}: RecipeActionsProps) {
  // Handle export recipes
  const handleExportRecipes = () => {
    try {
      const dataStr = JSON.stringify(recipes, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;

      const exportFileDefaultName = `recipes-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success(`${recipes.length} recipes exported successfully`);
    } catch (error) {
      console.error("Error exporting recipes:", error);
      toast.error("Failed to export recipes");
    }
  };

  // Handle import recipes (placeholder for future implementation)
  const handleImportClick = () => {
    // This would typically open a file input dialog
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast.info(
          "Import functionality will be implemented in a future update"
        );
        // Actual implementation would read the file and process the data
      }
    };
    input.click();
  };

  return (
    <motion.div
      className="flex items-center justify-between gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CurrencySelector />

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm"
            onClick={handleExportRecipes}
            disabled={recipes.length === 0}
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm ml-2"
            onClick={handleImportClick}
          >
            <FiUpload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm sm:hidden"
            >
              <FiSettings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={handleExportRecipes}
              disabled={recipes.length === 0}
              className="cursor-pointer"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              <span>Export Recipes</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleImportClick}
              className="cursor-pointer"
            >
              <FiUpload className="h-4 w-4 mr-2" />
              <span>Import Recipes</span>
            </DropdownMenuItem>
            {onCategoryFilterClick && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onCategoryFilterClick}
                  className="cursor-pointer"
                >
                  <FiFilter className="h-4 w-4 mr-2" />
                  <span>Filter by Category</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          onClick={onAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
        >
          <FiPlus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>
    </motion.div>
  );
}
