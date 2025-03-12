"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dish } from "@/lib/types";
import { FiX, FiFilter } from "react-icons/fi";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <FiFilter className="h-5 w-5 text-gray-500" />
            <DialogTitle className="text-xl">Filter Recipes</DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 mt-1.5">
            Filter recipes by category, allergens, price, and food cost.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 py-4">
          <div className="space-y-6">
            {/* Categories */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Categories
                </Label>
                <p className="text-sm text-gray-500 mt-0.5">
                  Select one or more categories to filter recipes
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      filters.categories.includes(category)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                    {filters.categories.includes(category) && (
                      <FiX className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Allergens
                </Label>
                <p className="text-sm text-gray-500 mt-0.5">
                  Filter recipes containing specific allergens
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueAllergens.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant={
                      filters.allergens.includes(allergen)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => toggleAllergen(allergen)}
                  >
                    {allergen}
                    {filters.allergens.includes(allergen) && (
                      <FiX className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Price Range
                </Label>
                <p className="text-sm text-gray-500 mt-0.5">
                  Filter recipes by their selling price
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handleNumberChange("minPrice", e.target.value)
                  }
                  className="w-24"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handleNumberChange("maxPrice", e.target.value)
                  }
                  className="w-24"
                />
              </div>
            </div>

            {/* Food Cost Range */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Food Cost Range
                </Label>
                <p className="text-sm text-gray-500 mt-0.5">
                  Filter recipes by their food cost
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minFoodCost || ""}
                  onChange={(e) =>
                    handleNumberChange("minFoodCost", e.target.value)
                  }
                  className="w-24"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxFoodCost || ""}
                  onChange={(e) =>
                    handleNumberChange("maxFoodCost", e.target.value)
                  }
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-gray-500"
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters} disabled={!hasActiveFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
