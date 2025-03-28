"use client";

import { useState, useEffect, useRef } from "react";
import { Filter as FilterIcon, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FilterOption,
  FilterValue,
  FilterComponentProps,
  isSearchFilter,
  isSelectFilter,
  isRangeFilter,
} from "./Filter.definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// FilterItem component for individual filter controls
function FilterItem({
  option,
  value,
  onChange,
}: {
  option: FilterOption;
  value: FilterValue[string];
  onChange: (id: string, value: FilterValue[string]) => void;
}) {
  const handleClear = () => {
    if (isSearchFilter(option)) {
      onChange(option.id, "");
    } else if (isRangeFilter(option)) {
      onChange(option.id, { min: undefined, max: undefined });
    } else if (isSelectFilter(option)) {
      onChange(option.id, option.defaultValue ?? "all");
    }
  };

  const isActive = () => {
    if (isSearchFilter(option)) {
      return value && value !== "";
    } else if (isSelectFilter(option)) {
      return value && value !== "all" && value !== option.defaultValue;
    } else if (isRangeFilter(option)) {
      const rangeValue = value as { min?: number; max?: number };
      return rangeValue?.min !== undefined || rangeValue?.max !== undefined;
    }
    return false;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {option.label}
        </label>
        {isActive() && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-primary hover:text-primary/80"
            aria-label={`Clear ${option.label}`}
          >
            Clear
          </button>
        )}
      </div>

      {isSearchFilter(option) && (
        <div className="relative">
          <Input
            type="text"
            placeholder={option.placeholder || "Search..."}
            value={(value as string) || ""}
            onChange={(e) => onChange(option.id, e.target.value)}
            className="h-8 bg-secondary/20 border-0 focus-visible:ring-1"
          />
          {value && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => onChange(option.id, "")}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {isSelectFilter(option) && (
        <select
          value={(value as string | number) || option.defaultValue || "all"}
          onChange={(e) => onChange(option.id, e.target.value)}
          className="w-full h-8 px-3 py-1 text-sm bg-secondary/20 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {option.options.map((opt) => (
            <option key={opt.value.toString()} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {isRangeFilter(option) && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              min={option.min}
              max={option.max}
              step={option.step}
              placeholder="Min"
              value={(value as { min?: number })?.min || ""}
              onChange={(e) => {
                const min = e.target.value ? Number(e.target.value) : undefined;
                const max = (value as { max?: number })?.max;
                onChange(option.id, { min, max });
              }}
              className="h-8 bg-secondary/20 border-0 focus-visible:ring-1"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative flex-1">
            <Input
              type="number"
              min={option.min}
              max={option.max}
              step={option.step}
              placeholder="Max"
              value={(value as { max?: number })?.max || ""}
              onChange={(e) => {
                const max = e.target.value ? Number(e.target.value) : undefined;
                const min = (value as { min?: number })?.min;
                onChange(option.id, { min, max });
              }}
              className="h-8 bg-secondary/20 border-0 focus-visible:ring-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterComponent({
  title = "Filter Options",
  filterOptions,
  initialValues = {},
  onFilterChange,
  className,
  labelClassName,
  placement = "bottom",
  applyLabel = "Apply",
  resetLabel = "Reset",
  filterButtonLabel = "Filter",
}: FilterComponentProps) {
  const [filters, setFilters] = useState<FilterValue>(() => {
    const defaultFilters: FilterValue = {};

    filterOptions.forEach((option) => {
      if (isRangeFilter(option)) {
        defaultFilters[option.id] = option.defaultValue || {
          min: undefined,
          max: undefined,
        };
      } else if (isSearchFilter(option)) {
        defaultFilters[option.id] = option.defaultValue || "";
      } else if (isSelectFilter(option)) {
        defaultFilters[option.id] = option.defaultValue || "all";
      }
    });

    return { ...defaultFilters, ...initialValues };
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate active filter count
  useEffect(() => {
    let count = 0;

    filterOptions.forEach((option) => {
      const value = filters[option.id];
      if (isSearchFilter(option) && value && value !== "") {
        count++;
      } else if (
        isSelectFilter(option) &&
        value !== "all" &&
        value !== option.defaultValue
      ) {
        count++;
      } else if (isRangeFilter(option)) {
        const rangeValue = value as { min?: number; max?: number };
        if (rangeValue?.min !== undefined || rangeValue?.max !== undefined) {
          count++;
        }
      }
    });

    setActiveFilterCount(count);
  }, [filters, filterOptions]);

  const handleFilterChange = (id: string, value: FilterValue[string]) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters: FilterValue = {};

    filterOptions.forEach((option) => {
      if (isRangeFilter(option)) {
        defaultFilters[option.id] = option.defaultValue || {
          min: undefined,
          max: undefined,
        };
      } else if (isSearchFilter(option)) {
        defaultFilters[option.id] = option.defaultValue || "";
      } else if (isSelectFilter(option)) {
        defaultFilters[option.id] = option.defaultValue || "all";
      }
    });

    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2 h-9 border-0 hover:bg-secondary/80 text-foreground",
          labelClassName
        )}
      >
        <FilterIcon className="h-4 w-4" />
        <span>{filterButtonLabel}</span>
        {activeFilterCount > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 p-4 shadow-lg bg-white border-0 rounded-lg w-64 mt-1",
            {
              "top-full left-0": placement === "bottom",
              "bottom-full left-0": placement === "top",
              "top-0 left-full": placement === "right",
              "top-0 right-full": placement === "left",
              "right-0": className?.includes("dropdown-end"),
            }
          )}
        >
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{title}</h3>
              <button
                type="button"
                className="text-xs text-primary hover:text-primary/80"
                onClick={resetFilters}
              >
                {resetLabel}
              </button>
            </div>

            <div className="space-y-4">
              {filterOptions.map((option) => (
                <FilterItem
                  key={option.id}
                  option={option}
                  value={filters[option.id]}
                  onChange={handleFilterChange}
                />
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <Button
                onClick={applyFilters}
                variant="ghost"
                size="sm"
                className="w-full border-0 hover:bg-secondary/80 text-foreground"
              >
                {applyLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterComponent;
