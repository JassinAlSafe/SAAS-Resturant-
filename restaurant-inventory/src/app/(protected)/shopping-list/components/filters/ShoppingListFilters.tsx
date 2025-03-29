"use client";

import { useState } from "react";
import {
  Filter,
  Search,
  Tag,
  X,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

  const clearFilters = () => {
    onCategoryChange("all");
    onSearchChange("");
    onShowPurchasedChange(false);
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <h3 className="card-title text-base flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Filters
            {hasActiveFilters && (
              <div className="badge badge-primary badge-sm">Active</div>
            )}
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-sm btn-ghost btn-square"
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-4 mt-2">
            {/* Search Input */}
            <div className="w-full">
              <div className="join w-full">
                <div className="join-item bg-base-200 flex items-center justify-center px-3 border border-base-300">
                  <Search className="h-4 w-4 text-base-content/60" />
                </div>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="join-item input input-bordered flex-grow focus:outline-primary"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="join-item btn btn-ghost border border-base-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Selector */}
            <div className="w-full">
              <label className="label">
                <span className="label-text flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Category
                </span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="select select-bordered w-full"
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
            <div className="flex flex-wrap gap-2">
              <span
                className={`badge ${
                  selectedCategory === "all" ? "badge-primary" : "badge-outline"
                } cursor-pointer`}
                onClick={() => onCategoryChange("all")}
              >
                All
              </span>
              {categories.slice(0, 6).map((category) => (
                <span
                  key={category}
                  className={`badge ${
                    selectedCategory === category
                      ? "badge-primary"
                      : "badge-outline"
                  } cursor-pointer`}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </span>
              ))}
              {categories.length > 6 && (
                <span className="badge badge-ghost text-base-content/60">
                  +{categories.length - 6} more
                </span>
              )}
            </div>

            {/* Show Purchased Checkbox */}
            <div className="w-full">
              <label className="cursor-pointer label justify-start gap-2">
                <input
                  type="checkbox"
                  checked={showPurchased}
                  onChange={() => onShowPurchasedChange(!showPurchased)}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text">Show purchased items</span>
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-outline btn-sm w-full gap-2"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
