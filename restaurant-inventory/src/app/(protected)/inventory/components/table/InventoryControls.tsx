"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Filter,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  Download,
  Upload,
  Printer,
  RefreshCw,
  SlidersHorizontal,
  XCircle,
  List,
  TableProperties,
  PlusCircle,
  Search,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export interface InventoryControlsProps {
  compactMode: boolean;
  setCompactMode: (mode: boolean) => void;
  sortConfig: {
    field: string;
    direction: "asc" | "desc";
  };
  setSortField: (field: string) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  selectedItemsValue: number;
  formatCurrency: (value: number) => string;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onCategoryFilterChange?: (category: string) => void;
  clearSelection: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onPrint?: () => void;
  isMobile?: boolean;
  renderSortIndicator?: (column: string) => React.ReactNode;
  handleHeaderClick?: (column: string) => void;
}

export function InventoryControls({
  compactMode,
  setCompactMode,
  sortConfig,
  setSortField,
  setSortDirection,
  selectedItems,
  setSelectedItems,
  selectedItemsValue,
  formatCurrency,
  onSearchChange,
  searchQuery,
  onCategoryFilterChange,
  clearSelection,
  onExport,
  onImport,
  onPrint,
  isMobile,
  renderSortIndicator,
  handleHeaderClick,
}: InventoryControlsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
      <div className="flex items-center flex-1 gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
              <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onCategoryFilterChange?.("all")}>
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onCategoryFilterChange?.("produce")}
            >
              Produce
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCategoryFilterChange?.("meat")}>
              Meat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCategoryFilterChange?.("dairy")}>
              Dairy
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onCategoryFilterChange?.("dry goods")}
            >
              Dry Goods
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onCategoryFilterChange?.("beverages")}
            >
              Beverages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3">
        {/* Show selected items actions */}
        {selectedItems.length > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              onClick={clearSelection}
            >
              Clear
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-9"
              onClick={onPrint}
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              onClick={onImport}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Import
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
