"use client";

import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FiSearch, FiFilter, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useState } from "react";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  sortField?: string;
  setSortField?: (field: string) => void;
  sortDirection?: "asc" | "desc";
  setSortDirection?: (direction: "asc" | "desc") => void;
}

export default function InventoryFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortField = "name",
  setSortField = () => {},
  sortDirection = "asc",
  setSortDirection = () => {},
}: InventoryFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <Card className="mb-4">
      <div className="p-4 space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 w-10 flex-shrink-0"
            >
              <FiFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-3 border-t">
            <h3 className="text-sm font-medium mb-2">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={sortField === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("name")}
                className="flex items-center"
              >
                Name
                {sortField === "name" &&
                  (sortDirection === "asc" ? (
                    <FiChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <FiChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </Button>
              <Button
                variant={sortField === "category" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("category")}
                className="flex items-center"
              >
                Category
                {sortField === "category" &&
                  (sortDirection === "asc" ? (
                    <FiChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <FiChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </Button>
              <Button
                variant={sortField === "quantity" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("quantity")}
                className="flex items-center"
              >
                Quantity
                {sortField === "quantity" &&
                  (sortDirection === "asc" ? (
                    <FiChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <FiChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </Button>
              <Button
                variant={sortField === "cost" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("cost")}
                className="flex items-center"
              >
                Cost
                {sortField === "cost" &&
                  (sortDirection === "asc" ? (
                    <FiChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <FiChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
