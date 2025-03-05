"use client";

import { Input } from "@/components/ui/input";
import { FiSearch, FiFilter, FiTag } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center mb-3">
        <FiFilter className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger
              id="category"
              className="w-full bg-gray-50 border-gray-200"
            >
              <div className="flex items-center">
                <FiTag className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Select a category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm font-medium text-gray-700 mr-1">
            Categories:
          </span>
          <Badge
            variant="outline"
            className={`cursor-pointer text-xs py-1 px-3 rounded-full ${
              selectedCategory === "all"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : "bg-gray-50"
            }`}
            onClick={() => onCategoryChange("all")}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={`cursor-pointer text-xs py-1 px-3 rounded-full ${
                selectedCategory === category
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-gray-50"
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="flex items-center pt-1">
          <div className="flex items-center space-x-2">
            <CustomCheckbox
              id="showPurchased"
              checked={showPurchased}
              onCheckedChange={onShowPurchasedChange}
            />
            <Label
              htmlFor="showPurchased"
              className="cursor-pointer text-gray-700"
            >
              Show purchased items
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
