"use client";

import { FilterComponent } from "@/components/ui/Common/Filter/Filter";
import {
  FilterOption,
  FilterValue,
} from "@/components/ui/Common/Filter/Filter.definitions";
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
  // Define category options based on active tab
  const categoryOptions =
    activeTab === "sales"
      ? [
          { value: "all", label: "All Categories" },
          { value: "main", label: "Main Course" },
          { value: "appetizer", label: "Appetizers" },
          { value: "dessert", label: "Desserts" },
          { value: "beverage", label: "Beverages" },
        ]
      : [
          { value: "all", label: "All Categories" },
          { value: "produce", label: "Produce" },
          { value: "meat", label: "Meat" },
          { value: "dairy", label: "Dairy" },
          { value: "dry-goods", label: "Dry Goods" },
        ];

  const filterOptions: FilterOption[] = [
    {
      id: "searchTerm",
      type: "search",
      label: "Search",
      placeholder: `Search ${
        activeTab === "sales" ? "items" : "ingredients"
      }...`,
    },
    {
      id: "category",
      type: "select",
      label: "Category",
      options: categoryOptions,
    },
    {
      id: "amount",
      type: "range",
      label: activeTab === "sales" ? "Amount Range" : "Quantity Range",
      min: 0,
      step: 1,
      max: 1000, // Adding a reasonable max value
    },
  ];

  const handleFilterChange = (filters: FilterValue) => {
    const searchTerm = (filters.searchTerm as string) || "";
    const category = (filters.category as string) || "all";
    const amountRange =
      (filters.amount as { min?: number; max?: number }) || {};

    onFilterChange({
      searchTerm,
      category,
      minAmount: amountRange.min,
      maxAmount: amountRange.max,
    });
  };

  return (
    <FilterComponent
      filterOptions={filterOptions}
      onFilterChange={handleFilterChange}
      className="dropdown-end"
      labelClassName="border-0 hover:bg-secondary/80 text-foreground"
      placement="bottom"
      title="Filter Options"
      filterButtonLabel="Filter"
      applyLabel="Apply Filters"
      resetLabel="Reset"
    />
  );
}
