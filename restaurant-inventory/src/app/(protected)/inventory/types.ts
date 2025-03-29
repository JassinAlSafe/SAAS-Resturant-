import { InventoryItem } from "@/lib/types";

// Interface for form data that includes both snake_case and camelCase properties
export interface InventoryFormData
    extends Omit<InventoryItem, "id" | "created_at" | "updated_at"> {
    reorderLevel?: number;
    expiryDate?: string;
    supplier_id?: string;
    image_url?: string;
}

// Interface for grouped inventory items
export interface GroupedInventoryItem extends Omit<InventoryItem, "id" | "quantity"> {
    ids: string[]; // All item IDs in this group
    totalQuantity: number; // Combined quantity
    latestUpdate: string; // Date of most recent update
    batchCount: number; // Number of distinct batches/entries
    // We keep the original items for reference when needed
    originalItems: InventoryItem[];
}

// Inventory stats interface
export interface InventoryStats {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number | string;
}

// Inventory view modes
export type InventoryViewMode = "table" | "cards";

// Interface for inventory content props
export interface InventoryContentProps {
    items: InventoryItem[];
    groupedItems: GroupedInventoryItem[];
    filteredGroupedItems?: GroupedInventoryItem[];
    sortedFilteredItems?: GroupedInventoryItem[];
    viewMode: InventoryViewMode;
    onEditClick: (item: InventoryItem) => void;
    onDeleteClick: (item: InventoryItem) => void;
    onUpdateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
    selectedItems: string[];
    toggleItemSelection: (itemId: string) => void;
    toggleAllItems: (itemIds: string[]) => void;
    formatCurrency: (value: number) => string;
}

// Export InventoryItem for use in other components
export type { InventoryItem };