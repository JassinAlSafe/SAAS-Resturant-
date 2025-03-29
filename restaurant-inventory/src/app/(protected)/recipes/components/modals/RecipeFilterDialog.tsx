"use client";

import { useState, useEffect } from "react";
import { FiX, FiFilter, FiCheck } from "react-icons/fi";
import { Dish } from "@/lib/types";

interface FilterCriteria {
  categories: string[];
  allergens: string[];
  minPrice?: number;
  maxPrice?: number;
  minFoodCost?: number;
  maxFoodCost?: number;
}

interface RecipeFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Dish[];
  onFilter: (criteria: FilterCriteria) => void;
}

export default function RecipeFilterDialog({
  isOpen,
  onClose,
  recipes,
  onFilter,
}: RecipeFilterDialogProps) {
  // Extract unique categories and allergens from recipes
  const uniqueCategories = Array.from(
    new Set(
      recipes
        .map((recipe) => recipe.category)
        .filter((category): category is string => !!category)
    )
  ).sort();

  const uniqueAllergens = Array.from(
    new Set(recipes.flatMap((recipe) => recipe.allergies || []))
  ).sort();

  // State for filter criteria
  const [filters, setFilters] = useState<FilterCriteria>({
    categories: [],
    allergens: [],
  });

  // Reset filters when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFilters({
        categories: [],
        allergens: [],
      });
    }
  }, [isOpen]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  // Toggle allergen selection
  const toggleAllergen = (allergen: string) => {
    setFilters((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  // Handle number input changes
  const handleNumberChange = (field: keyof FilterCriteria, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    setFilters((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.allergens.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minFoodCost !== undefined ||
    filters.maxFoodCost !== undefined;

  // Apply filters
  const handleApplyFilters = () => {
    onFilter(filters);
    onClose();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      categories: [],
      allergens: [],
      minPrice: undefined,
      maxPrice: undefined,
      minFoodCost: undefined,
      maxFoodCost: undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-100 p-2.5 rounded-md">
              <FiFilter className="h-5 w-5 text-neutral-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Filter Recipes
              </h3>
              <p className="text-neutral-500 text-sm mt-0.5">
                Refine your recipe list with custom filters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <div className="space-y-8">
            {/* Categories */}
            <div className="space-y-3">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-900 flex items-center">
                  Categories
                  {filters.categories.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-xs">
                      {filters.categories.length} selected
                    </span>
                  )}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Select categories to filter your recipes
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${
                        filters.categories.includes(category)
                          ? "bg-neutral-800 text-white border border-neutral-800"
                          : "bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100"
                      }
                    `}
                  >
                    {category}
                    {filters.categories.includes(category) && (
                      <FiCheck className="ml-1.5 inline-block h-3.5 w-3.5" />
                    )}
                  </button>
                ))}
                {uniqueCategories.length === 0 && (
                  <span className="text-sm text-neutral-500 italic">
                    No categories available
                  </span>
                )}
              </div>
            </div>

            {/* Allergens */}
            <div className="space-y-3">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-900 flex items-center">
                  Allergens
                  {filters.allergens.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-xs">
                      {filters.allergens.length} selected
                    </span>
                  )}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Filter recipes containing these allergens
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {uniqueAllergens.map((allergen) => (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${
                        filters.allergens.includes(allergen)
                          ? "bg-neutral-800 text-white border border-neutral-800"
                          : "bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100"
                      }
                    `}
                  >
                    {allergen}
                    {filters.allergens.includes(allergen) && (
                      <FiCheck className="ml-1.5 inline-block h-3.5 w-3.5" />
                    )}
                  </button>
                ))}
                {uniqueAllergens.length === 0 && (
                  <span className="text-sm text-neutral-500 italic">
                    No allergens available
                  </span>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-900 flex items-center">
                  Price Range
                  {(filters.minPrice !== undefined ||
                    filters.maxPrice !== undefined) && (
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-xs">
                      Active
                    </span>
                  )}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Set minimum and maximum price values
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-600">
                    Minimum Price
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                      kr
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full py-2 pl-10 pr-3 border border-neutral-300 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      value={filters.minPrice ?? ""}
                      onChange={(e) =>
                        handleNumberChange("minPrice", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-600">
                    Maximum Price
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                      kr
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full py-2 pl-10 pr-3 border border-neutral-300 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      value={filters.maxPrice ?? ""}
                      onChange={(e) =>
                        handleNumberChange("maxPrice", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Food Cost Range */}
            <div className="space-y-3">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-900 flex items-center">
                  Food Cost Range
                  {(filters.minFoodCost !== undefined ||
                    filters.maxFoodCost !== undefined) && (
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-xs">
                      Active
                    </span>
                  )}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Set minimum and maximum food cost values
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-600">
                    Minimum Food Cost
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                      kr
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full py-2 pl-10 pr-3 border border-neutral-300 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      value={filters.minFoodCost ?? ""}
                      onChange={(e) =>
                        handleNumberChange("minFoodCost", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-600">
                    Maximum Food Cost
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                      kr
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full py-2 pl-10 pr-3 border border-neutral-300 rounded-md text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500 text-sm"
                      value={filters.maxFoodCost ?? ""}
                      onChange={(e) =>
                        handleNumberChange("maxFoodCost", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 flex justify-between bg-neutral-50">
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
              ${
                hasActiveFilters
                  ? "text-neutral-700 hover:bg-neutral-200"
                  : "text-neutral-400 cursor-not-allowed"
              }
            `}
          >
            Clear All
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={!hasActiveFilters}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  hasActiveFilters
                    ? "bg-neutral-800 text-white hover:bg-neutral-900"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }
              `}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
