"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  recipes = []
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
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => handleViewModeChange("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }
              >
                <FiGrid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => handleViewModeChange("list")}
                className={
                  viewMode === "list"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }
              >
                <FiList className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>List view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Button
        onClick={onAddClick}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
      >
        <FiPlus className="h-4 w-4 mr-2" />
        Add Recipe
      </Button>
    </motion.div>
  );
}
