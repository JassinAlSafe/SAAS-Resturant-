import InventoryFilters from "./InventoryFilters";

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
  viewMode?: "table" | "cards";
  onViewModeChange?: (mode: "table" | "cards") => void;
  onAddClick?: () => void;
}

export function InventoryFiltersWrapper({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  showLowStock,
  onLowStockChange,
  lowStockCount,
  outOfStockCount,
  viewMode,
  onViewModeChange,
  onAddClick,
}: InventoryFiltersProps) {
  console.log(
    "InventoryFiltersWrapper: lowStockCount:",
    lowStockCount,
    "outOfStockCount:",
    outOfStockCount
  );

  return (
    <InventoryFilters
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      categories={categories}
      sortField={sortField}
      setSortField={setSortField}
      sortDirection={sortDirection}
      setSortDirection={setSortDirection}
      showLowStock={showLowStock}
      onLowStockChange={onLowStockChange}
      lowStockCount={lowStockCount}
      outOfStockCount={outOfStockCount}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      onAddClick={onAddClick}
    />
  );
}
