"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter, Search } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import { CurrencySelector } from "@/components/currency-selector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InventoryActionsProps {
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onAddClick: () => void;
  onExportClick: () => void;
}

export default function InventoryActions({
  categories = [],
  selectedCategory = "all",
  onCategoryChange = () => {},
  searchQuery = "",
  onSearchChange = () => {},
  onAddClick,
  onExportClick,
}: InventoryActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onAddClick}
              className="bg-green-600 hover:bg-green-700 text-white mr-auto"
              size="default"
            >
              <Plus className="mr-2 h-4 w-4 stroke-[2px]" />
              Add Item
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add a new inventory item</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex flex-1 gap-3 max-w-full sm:max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, category..."
            className="pl-8 border-muted-foreground/20 shadow-sm focus-visible:ring-blue-500"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[160px] border-muted-foreground/20 shadow-sm">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
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
            </TooltipTrigger>
            <TooltipContent>Filter by category</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-2">
        <CurrencySelector />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ExportButton
                onExport={onExportClick}
                label="Export"
                tooltipText="Download inventory as Excel file"
                variant="outline"
              />
            </TooltipTrigger>
            <TooltipContent>Export inventory data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
