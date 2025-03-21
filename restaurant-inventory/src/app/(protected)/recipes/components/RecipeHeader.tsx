"use client";

import { FiBook, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface RecipeHeaderProps {
  error?: string;
  retry?: () => void;
  totalRecipes?: number;
  showArchivedRecipes?: boolean;
}

export default function RecipeHeader({
  error,
  retry,
  totalRecipes,
  showArchivedRecipes = false,
}: RecipeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="relative">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/20">
          <FiBook className="h-7 w-7 text-white" />
        </div>
        {totalRecipes !== undefined && (
          <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold h-6 min-w-6 px-1.5 rounded-full border border-indigo-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
            {totalRecipes > 99 ? "99+" : totalRecipes}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {showArchivedRecipes ? "Archived Recipes" : "Recipes"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {showArchivedRecipes
            ? "View and manage archived recipes"
            : "Create and manage your restaurant's recipes and menu items"}
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm"
        >
          <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          {retry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={retry}
              className="h-8 px-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <FiRefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
