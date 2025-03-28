import { ReactNode } from "react";

export type FilterValueType = string | number | boolean | null | undefined;

export type BaseFilterOption = {
  id: string;
  label: string;
  placeholder?: string;
};

export type SearchFilterOption = BaseFilterOption & {
  type: "search";
  defaultValue?: string;
};

export type SelectFilterOption = BaseFilterOption & {
  type: "select";
  options: Array<{ value: string | number; label: string }>;
  defaultValue?: string | number;
};

export type RangeFilterOption = BaseFilterOption & {
  type: "range";
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: { min?: number; max?: number };
};

export type FilterOption =
  | SearchFilterOption
  | SelectFilterOption
  | RangeFilterOption;

export type FilterValue = {
  [key: string]: FilterValueType | { min?: number; max?: number };
};

export interface FilterComponentProps {
  title?: string;
  filterOptions: FilterOption[];
  initialValues?: FilterValue;
  onFilterChange: (filters: FilterValue) => void;
  className?: string;
  labelClassName?: string;
  placement?: "top" | "bottom" | "left" | "right";
  children?: ReactNode;
  applyLabel?: string;
  resetLabel?: string;
  filterButtonLabel?: string;
}

// Helper type guards
export const isSearchFilter = (
  option: FilterOption
): option is SearchFilterOption => option.type === "search";

export const isSelectFilter = (
  option: FilterOption
): option is SelectFilterOption => option.type === "select";

export const isRangeFilter = (
  option: FilterOption
): option is RangeFilterOption => option.type === "range";
