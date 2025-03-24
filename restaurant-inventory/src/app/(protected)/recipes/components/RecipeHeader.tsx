"use client";

import { Button } from "@/components/ui/button";
import { FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
  // Use either onRetry or retry prop
  const handleRetry = onRetry || retry;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Recipes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 justify-between"
              >
                {showArchivedRecipes ? "Archived Recipes" : "Active Recipes"}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onToggleArchivedRecipes?.(false)}
              >
                Active Recipes
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onToggleArchivedRecipes?.(true)}
              >
                Archived Recipes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              >
                Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                Import
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Export
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Bulk edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm mt-4"
        >
          <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          {handleRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-auto p-0 px-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Retry
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
