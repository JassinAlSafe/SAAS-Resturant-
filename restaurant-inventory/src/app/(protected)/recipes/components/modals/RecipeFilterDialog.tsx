"use client";

import { useState, useEffect } from "react";
import { FiX, FiFilter } from "react-icons/fi";
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
    <dialog open={isOpen} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box max-h-[85vh] p-0">
        <div className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <FiFilter className="h-5 w-5 text-base-content/70" />
            <h3 className="text-xl font-semibold">Filter Recipes</h3>
          </div>
          <p className="text-base-content/70 mt-1.5">
            Filter recipes by category, allergens, price, and food cost.
          </p>
        </div>

        <div
          className="overflow-y-auto px-6 py-4"
          style={{ maxHeight: "60vh" }}
        >
          <div className="space-y-6">
            {/* Categories */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Categories</label>
                <p className="text-sm text-base-content/70 mt-0.5">
                  Select one or more categories to filter recipes
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`badge ${
                      filters.categories.includes(category)
                        ? "badge-primary"
                        : "badge-outline"
                    } cursor-pointer`}
                  >
                    {category}
                    {filters.categories.includes(category) && (
                      <FiX className="ml-1 h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Allergens</label>
                <p className="text-sm text-base-content/70 mt-0.5">
                  Filter recipes containing specific allergens
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueAllergens.map((allergen) => (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`badge ${
                      filters.allergens.includes(allergen)
                        ? "badge-secondary"
                        : "badge-outline"
                    } cursor-pointer`}
                  >
                    {allergen}
                    {filters.allergens.includes(allergen) && (
                      <FiX className="ml-1 h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Price Range</label>
                <p className="text-sm text-base-content/70 mt-0.5">
                  Filter recipes by their price
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Min Price</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      handleNumberChange("minPrice", e.target.value)
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Price</span>
                  </label>
                  <input
                    type="number"
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      handleNumberChange("maxPrice", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Food Cost Range */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Food Cost Range</label>
                <p className="text-sm text-base-content/70 mt-0.5">
                  Filter recipes by their food cost
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Min Food Cost</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={filters.minFoodCost || ""}
                    onChange={(e) =>
                      handleNumberChange("minFoodCost", e.target.value)
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Food Cost</span>
                  </label>
                  <input
                    type="number"
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={filters.maxFoodCost || ""}
                    onChange={(e) =>
                      handleNumberChange("maxFoodCost", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-6 flex justify-between">
          <button
            onClick={handleClearFilters}
            className="btn btn-outline"
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              className="btn btn-primary"
              disabled={!hasActiveFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
