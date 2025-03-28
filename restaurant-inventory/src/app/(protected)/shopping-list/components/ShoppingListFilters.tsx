"use client";

import { useState } from "react";
import {
  Search,
  Tag,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShoppingListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  showPurchased: boolean;
  onShowPurchasedChange: (value: boolean) => void;
  categories: string[];
}

export default function ShoppingListFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showPurchased,
  onShowPurchasedChange,
  categories,
}: ShoppingListFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasActiveFilters =
    selectedCategory !== "all" || showPurchased || searchTerm.trim().length > 0;

  // Group categories by first letter for better organization in dropdown
  const groupedCategories = categories.reduce<Record<string, string[]>>(
    (acc, category) => {
      const firstLetter = category.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(category);
      return acc;
    },
    {}
  );

  // Sort the category groups alphabetically
  const sortedGroups = Object.keys(groupedCategories).sort();

  // Get category color styling
  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {
        Produce: {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-700 dark:text-green-300",
          border: "border-green-200 dark:border-green-700",
        },
        Meat: {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-700 dark:text-red-300",
          border: "border-red-200 dark:border-red-700",
        },
        Dairy: {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-700",
        },
        Bakery: {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-700",
        },
        Pantry: {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          text: "text-yellow-700 dark:text-yellow-300",
          border: "border-yellow-200 dark:border-yellow-700",
        },
        Seafood: {
          bg: "bg-cyan-50 dark:bg-cyan-900/20",
          text: "text-cyan-700 dark:text-cyan-300",
          border: "border-cyan-200 dark:border-cyan-700",
        },
        Frozen: {
          bg: "bg-indigo-50 dark:bg-indigo-900/20",
          text: "text-indigo-700 dark:text-indigo-300",
          border: "border-indigo-200 dark:border-indigo-700",
        },
        Beverages: {
          bg: "bg-purple-50 dark:bg-purple-900/20",
          text: "text-purple-700 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-700",
        },
      };

    return (
      colors[categoryName] || {
        bg: "bg-gray-50 dark:bg-gray-800/30",
        text: "text-gray-700 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-700",
      }
    );
  };

  const clearFilters = () => {
    onCategoryChange("all");
    onSearchChange("");
    onShowPurchasedChange(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-md border border-base-200/70 rounded-lg overflow-hidden"
    >
      <div className="card-body p-5">
        <motion.div layout className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-lg">
              Filters
              {hasActiveFilters && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  Active
                </motion.span>
              )}
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-200/80 transition-colors"
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="space-y-5 mt-4"
            >
              {/* Search Input */}
              <div className="form-control">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-base-content/50" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items by name..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="input input-bordered w-full pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => onSearchChange("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <X className="h-4 w-4 text-base-content/50 hover:text-base-content transition-colors" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Category Selector */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Category
                  </span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="select select-bordered w-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {sortedGroups.map((letter) => (
                    <optgroup key={letter} label={letter}>
                      {groupedCategories[letter].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Category Quick Select */}
              <div>
                <label className="label mb-1">
                  <span className="label-text-alt text-base-content/70">
                    Quick Select
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <motion.span
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors border",
                      selectedCategory === "all"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-base-200/50 text-base-content/70 border-base-200 hover:bg-base-200"
                    )}
                    onClick={() => onCategoryChange("all")}
                  >
                    All
                  </motion.span>
                  {categories.slice(0, 6).map((category) => (
                    <motion.span
                      key={category}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCategoryChange(category)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors border shadow-sm",
                        selectedCategory === category
                          ? cn(
                              getCategoryColor(category).bg,
                              getCategoryColor(category).text,
                              getCategoryColor(category).border
                            )
                          : "bg-base-200/50 text-base-content/70 border-base-200 hover:bg-base-200"
                      )}
                    >
                      {category}
                    </motion.span>
                  ))}
                  {categories.length > 6 && (
                    <motion.span
                      whileHover={{ scale: 1.05, y: -1 }}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-base-200/50 text-base-content/70 border border-base-200"
                    >
                      +{categories.length - 6} more
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Show Purchased Checkbox */}
              <div className="form-control w-fit">
                <label className="cursor-pointer label justify-start gap-3 py-2 pl-1 hover:bg-base-200/50 rounded-lg transition-colors px-2">
                  <input
                    type="checkbox"
                    checked={showPurchased}
                    onChange={() => onShowPurchasedChange(!showPurchased)}
                    className="checkbox checkbox-sm checkbox-success focus:ring-2 focus:ring-success/20"
                  />
                  <div className="flex flex-col">
                    <span className="label-text font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      Show purchased items
                    </span>
                  </div>
                </label>
              </div>

              {/* Clear Filters */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearFilters}
                      className="btn btn-sm btn-outline btn-block gap-2 hover:bg-base-200 focus:ring-2 focus:ring-base-200 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                      Reset all filters
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
