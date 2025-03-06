"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TabType } from "../types";

interface ReportsFilterProps {
  activeTab: TabType;
  onFilterChange: (filters: ReportFilters) => void;
}

export interface ReportFilters {
  searchTerm: string;
  category: string;
  minAmount?: number;
  maxAmount?: number;
}

export function ReportsFilter({
  activeTab,
  onFilterChange,
}: ReportsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: "",
    category: "all",
    minAmount: undefined,
    maxAmount: undefined,
  });

  const handleFilterChange = (
    key: keyof ReportFilters,
    value: string | number | undefined
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-muted flex items-center gap-1.5 text-muted-foreground"
        >
          <FilterIcon className="h-3.5 w-3.5" />
          <span>Filter</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Filter {activeTab === "sales" ? "Sales" : "Inventory"}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder={`Search ${
                activeTab === "sales" ? "items" : "ingredients"
              }...`}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {activeTab === "sales" ? (
                  <>
                    <SelectItem value="main">Main Course</SelectItem>
                    <SelectItem value="appetizer">Appetizers</SelectItem>
                    <SelectItem value="dessert">Desserts</SelectItem>
                    <SelectItem value="beverage">Beverages</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="dry-goods">Dry Goods</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {activeTab === "sales" ? "Amount Range" : "Quantity Range"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minAmount || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "minAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxAmount || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "maxAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                const resetFilters = {
                  searchTerm: "",
                  category: "all",
                  minAmount: undefined,
                  maxAmount: undefined,
                };
                setFilters(resetFilters);
                onFilterChange(resetFilters);
                setIsOpen(false);
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setIsOpen(false)}>Apply</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
