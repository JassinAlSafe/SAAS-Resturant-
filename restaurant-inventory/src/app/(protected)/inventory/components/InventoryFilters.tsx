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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CustomToggle } from "@/components/ui/custom-toggle";

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
  showLowStock?: boolean;
  onLowStockChange?: (value: boolean) => void;
  lowStockCount?: number;
  outOfStockCount?: number;
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
  showLowStock = false,
  onLowStockChange = () => {},
  lowStockCount = 0,
  outOfStockCount = 0,
}: InventoryFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <Card className="mb-4">
      <div className="p-4 space-y-4">
        {/* Search Bar and Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full bg-background/50 focus:bg-background transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background/50 focus:bg-background transition-colors">
                <SelectValue placeholder="All Categories" />
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-9 w-9 bg-background/50 hover:bg-background transition-colors"
                  >
                    <FiFilter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle advanced filters</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center justify-between rounded-lg p-3 bg-background/50">
          <div className="flex items-center gap-3">
            <CustomToggle
              id="show-low-stock"
              checked={showLowStock}
              onCheckedChange={onLowStockChange}
              size="md"
              color="primary"
              label="Show Low/Out of Stock Only"
            />
          </div>
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="flex gap-2">
              {outOfStockCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-red-100/50 text-red-700 hover:bg-red-100"
                >
                  {outOfStockCount} out of stock
                </Badge>
              )}
              {lowStockCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100/50 text-yellow-700 hover:bg-yellow-100"
                >
                  {lowStockCount} low stock
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Sort By
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "name", label: "Name" },
                { key: "category", label: "Category" },
                { key: "quantity", label: "Quantity" },
                { key: "cost", label: "Cost" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortField === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange(key)}
                  className={cn(
                    "flex items-center gap-1 h-8",
                    sortField === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/50 hover:bg-background"
                  )}
                >
                  {label}
                  {sortField === key &&
                    (sortDirection === "asc" ? (
                      <FiChevronUp className="h-3 w-3" />
                    ) : (
                      <FiChevronDown className="h-3 w-3" />
                    ))}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
