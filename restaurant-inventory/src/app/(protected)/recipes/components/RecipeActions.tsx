"use client";

import { Button } from "@/components/ui/button";
import { FiGrid, FiList, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dish } from "@/lib/types";

interface RecipeActionsProps {
  onAddClick: () => void;
  onViewModeChange?: (mode: "grid" | "list") => void;
  onCategoryFilterClick?: () => void;
  recipes?: Dish[];
}

export default function RecipeActions({
  onAddClick,
  onViewModeChange,
  // These props are included for TypeScript compatibility with parent components
  // but are not currently used in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCategoryFilterClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recipes = [],
}: RecipeActionsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center justify-end gap-2 mb-6"
    >
      <div className="flex items-stretch rounded-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewModeChange("grid")}
          className={`h-10 w-10 rounded-none ${
            viewMode === "grid"
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FiGrid className="h-5 w-5" />
          <span className="sr-only">Grid view</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewModeChange("list")}
          className={`h-10 w-10 rounded-none ${
            viewMode === "list"
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FiList className="h-5 w-5" />
          <span className="sr-only">List view</span>
        </Button>
      </div>

      <Button
        onClick={onAddClick}
        size="default"
        className="h-10 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
      >
        <FiPlus className="h-4 w-4 mr-2" />
        Add Recipe
      </Button>
    </motion.div>
  );
}
