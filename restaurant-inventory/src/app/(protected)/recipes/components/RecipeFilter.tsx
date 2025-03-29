"use client";

import { FiX, FiChevronRight, FiFilter, FiSliders } from "react-icons/fi";

interface PriceRange {
  min?: number;
  max?: number;
}

interface RecipeFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  onFilterApply: () => void;
  onFilterReset: () => void;
  onAdvancedFilterClick?: () => void;
}

export default function RecipeFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  onFilterApply,
  onFilterReset,
  onAdvancedFilterClick,
}: RecipeFilterProps) {
  const handleMinPriceChange = (value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    onPriceRangeChange({ ...priceRange, min: numValue });
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    onPriceRangeChange({ ...priceRange, max: numValue });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceRange.min !== undefined ||
    priceRange.max !== undefined;

  return (
    <div className="mt-3 mb-4 p-4 border border-neutral-300 rounded-md bg-white">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-neutral-800 flex items-center text-sm">
          <FiFilter className="mr-2 h-4 w-4 text-neutral-500" />
          Quick Filters
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onFilterReset}
            className="text-xs text-neutral-500 hover:text-neutral-700 flex items-center"
          >
            Reset
            <FiX className="ml-1 h-3 w-3" />
          </button>
          {onAdvancedFilterClick && (
            <button
              onClick={onAdvancedFilterClick}
              className="text-xs text-neutral-700 hover:text-neutral-900 flex items-center font-medium"
            >
              Advanced Filters
              <FiSliders className="ml-1 h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Categories */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-700">
            Categories
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.length > 0 ? (
              categories.slice(0, 5).map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? "bg-neutral-800 text-white"
                      : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {category}
                </button>
              ))
            ) : (
              <span className="text-xs text-neutral-500 italic">
                No categories available
              </span>
            )}
            {categories.length > 5 && (
              <button
                onClick={onAdvancedFilterClick}
                className="text-xs text-neutral-700 flex items-center hover:text-neutral-900"
              >
                More <FiChevronRight className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-700">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-neutral-500 text-xs">
                Min kr
              </span>
              <input
                type="number"
                placeholder="0"
                min="0"
                step="1"
                className="w-full py-1.5 pl-12 pr-2 text-xs border border-neutral-300 rounded-md text-neutral-800"
                value={priceRange.min ?? ""}
                onChange={(e) => handleMinPriceChange(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-neutral-500 text-xs">
                Max kr
              </span>
              <input
                type="number"
                placeholder="1000"
                min="0"
                step="1"
                className="w-full py-1.5 pl-12 pr-2 text-xs border border-neutral-300 rounded-md text-neutral-800"
                value={priceRange.max ?? ""}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Apply button */}
        <div className="flex items-end">
          <button
            onClick={onFilterApply}
            disabled={!hasActiveFilters}
            className={`w-full py-1.5 rounded-md transition-colors text-sm font-medium ${
              hasActiveFilters
                ? "bg-neutral-800 text-white hover:bg-neutral-900"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
