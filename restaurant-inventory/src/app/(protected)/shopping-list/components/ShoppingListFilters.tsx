"use client";

import { useState } from "react";
import { Filter, Search, Tag, X } from "lucide-react";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-black flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            Filters
            {hasActiveFilters && (
              <div className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                Active
              </div>
            )}
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? "−" : "+"}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="w-full">
              <div className="flex w-full">
                <div className="bg-gray-50 flex items-center justify-center px-3 rounded-l-md border border-r-0 border-gray-200">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-grow px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="px-3 flex items-center justify-center bg-gray-50 border border-l-0 border-gray-200 rounded-r-md text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {!searchTerm && (
                  <div className="px-3 flex items-center justify-center bg-gray-50 border border-l-0 border-gray-200 rounded-r-md text-gray-300">
                    <X className="h-4 w-4 invisible" />
                  </div>
                )}
              </div>
            </div>

            {/* Category Selector */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                  selectedCategory === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => onCategoryChange("all")}
              >
                All
              </span>
              {categories.slice(0, 6).map((category) => (
                <span
                  key={category}
                  className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </span>
              ))}
              {categories.length > 6 && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                  +{categories.length - 6} more
                </span>
              )}
            </div>

            {/* Show Purchased Checkbox */}
            <div className="w-full">
              <label className="flex items-center cursor-pointer gap-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showPurchased}
                    onChange={() => onShowPurchasedChange(!showPurchased)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 border ${
                      showPurchased
                        ? "bg-orange-500 border-orange-500"
                        : "bg-white border-gray-300"
                    } rounded transition-colors`}
                  >
                    {showPurchased && (
                      <svg
                        className="w-4 h-4 text-white fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700">
                  Show purchased items
                </span>
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 px-4 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
