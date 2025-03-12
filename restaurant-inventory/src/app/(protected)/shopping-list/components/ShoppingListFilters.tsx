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
import { Separator } from "@/components/ui/separator";

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
    <div className="bg-background border rounded-md">
      <div className="px-4 py-3 border-b">
        <h3 className="flex items-center text-lg font-medium">
          <FiFilter className="h-5 w-5 text-muted-foreground mr-2" />
          Filters
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <Label htmlFor="category" className="mb-1.5 block">
            Category
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger id="category" className="w-full">
              <div className="flex items-center">
                <FiTag className="mr-2 h-4 w-4 text-muted-foreground" />
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

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onCategoryChange("all")}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center space-x-2">
          <CustomCheckbox
            id="showPurchased"
            checked={showPurchased}
            onCheckedChange={onShowPurchasedChange}
          />
          <Label htmlFor="showPurchased" className="cursor-pointer">
            Show purchased items
          </Label>
        </div>
      </div>
    </div>
  );
}
