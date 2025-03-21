"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSearch, FiArchive, FiSliders } from "react-icons/fi";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <FiSearch className="h-4 w-4" />
          </div>
          <Input
            placeholder="Search recipes by name, category, or ingredients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              onClick={() => onSearchChange("")}
            >
              <span className="sr-only">Clear search</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleArchivedRecipes && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showArchivedRecipes ? "secondary" : "outline"}
                    size="sm"
                    className={`text-slate-600 dark:text-slate-300 whitespace-nowrap ${
                      showArchivedRecipes
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                    onClick={() => onToggleArchivedRecipes(!showArchivedRecipes)}
                  >
                    <FiArchive className="h-4 w-4 mr-2" />
                    {showArchivedRecipes ? "Show Active" : "Show Archived"}
                    {showArchivedRecipes && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 border-0"
                      >
                        Archived
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showArchivedRecipes
                    ? "Switch to active recipes"
                    : "View archived recipes"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 whitespace-nowrap"
                  onClick={onFilterClick}
                >
                  <FiSliders className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </TooltipTrigger>
              <TooltipContent>Filter recipes by category, price, and more</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
}
