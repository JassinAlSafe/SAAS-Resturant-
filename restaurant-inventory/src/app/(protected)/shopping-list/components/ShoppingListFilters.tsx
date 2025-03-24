"use client";

import { Input } from "@/components/ui/input";
import { FiSearch, FiFilter, FiTag, FiX } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

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
  const hasActiveFilters = selectedCategory !== "all" || showPurchased || searchTerm.trim().length > 0;

  // Group categories by first letter for better organization in dropdown
  const groupedCategories = categories.reduce<Record<string, string[]>>((acc, category) => {
    const firstLetter = category.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(category);
    return acc;
  }, {});

  // Sort the category groups alphabetically
  const sortedGroups = Object.keys(groupedCategories).sort();

  const clearFilters = () => {
    onCategoryChange("all");
    onSearchChange("");
    onShowPurchasedChange(false);
  };

  return (
    <Card className="bg-background border rounded-md">
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center text-lg font-medium">
          <FiFilter className="h-5 w-5 text-muted-foreground mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse filters" : "Expand filters"}
          className="h-8 px-2"
        >
          <span className="sr-only">{isOpen ? "Hide" : "Show"}</span>
          {isOpen ? "−" : "+"}
        </Button>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-4 space-y-4">
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
              aria-label="Search shopping list items"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 px-3 py-0 h-full"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
              >
                <FiX className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="category" className="mb-1.5 block font-medium">
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
                {sortedGroups.map((letter) => (
                  <SelectGroup key={letter}>
                    <SelectLabel>{letter}</SelectLabel>
                    {groupedCategories[letter].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer hover:bg-muted-foreground/10 transition-colors"
              onClick={() => onCategoryChange("all")}
            >
              All
            </Badge>
            {categories.slice(0, 6).map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Badge>
            ))}
            {categories.length > 6 && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted-foreground/10 transition-colors"
              >
                +{categories.length - 6} more
              </Badge>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CustomCheckbox
                id="showPurchased"
                checked={showPurchased}
                onCheckedChange={onShowPurchasedChange}
                aria-label="Show purchased items"
              />
              <Label 
                htmlFor="showPurchased" 
                className="cursor-pointer flex-1"
              >
                Show purchased items
              </Label>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <FiX className="mr-2 h-4 w-4" />
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}