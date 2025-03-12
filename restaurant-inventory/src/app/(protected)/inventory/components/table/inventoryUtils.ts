import { InventoryItem } from "@/lib/types";

// Helper function to pluralize units correctly
export const formatUnit = (quantity: number, unit: string): string => {
    // Don't pluralize certain units
    if (["kg", "g", "l", "ml"].includes(unit.toLowerCase())) {
        return unit;
    }

    // Pluralize common units
    const pluralRules: Record<string, string> = {
        box: "boxes",
        can: "cans",
        bottle: "bottles",
        piece: "pieces",
        unit: "units",
    };

    return quantity === 1
        ? unit
        : pluralRules[unit.toLowerCase()] || `${unit}s`;
};

// Calculate reorder level if not provided
export const getReorderLevel = (item: InventoryItem): number => {
    return item.reorder_point || item.minimum_stock_level || 5; // Default to 5 if not specified
};

// Check if item is low on stock
export const isLowStock = (item: InventoryItem): boolean => {
    return (
        item.quantity > 0 &&
        item.quantity <= (item.reorder_point || item.minimum_stock_level || 5)
    );
};

// Check if item is out of stock
export const isOutOfStock = (item: InventoryItem): boolean => {
    return item.quantity === 0;
};

// Get stock status letter
export const getStockStatusLetter = (item: InventoryItem): string => {
    if (item.quantity === 0) return "C";
    if (item.quantity <= (item.reorder_point || item.minimum_stock_level || 5))
        return "B";
    return "A";
};

// Get stock status color
export const getStockStatusColor = (item: InventoryItem): string => {
    const status = getStockStatusLetter(item);
    if (status === "C")
        return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200/40 dark:border-red-800/30";
    if (status === "B")
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200/40 dark:border-amber-800/30";
    return "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200/40 dark:border-green-800/30";
};

// Calculate inventory statistics
export const calculateInventoryStats = (
    items: InventoryItem[],
    selectedItems: string[],
    formatCurrency: (value: number) => string
) => {
    return {
        totalItems: items.length,
        totalValue: items.reduce(
            (sum, item) => sum + item.cost_per_unit * item.quantity,
            0
        ),
        lowStockItems: items.filter((item) => isLowStock(item)).length,
        outOfStockItems: items.filter((item) => isOutOfStock(item)).length,
        inStockItems: items.filter(
            (item) => !isLowStock(item) && !isOutOfStock(item)
        ).length,
        categories: [...new Set(items.map((item) => item.category))].length,
        selectedItemsCount: selectedItems.length,
        selectedItemsValue: selectedItems.length > 0
            ? selectedItems.reduce((sum, id) => {
                const item = items.find((i) => i.id === id);
                return sum + (item ? item.cost_per_unit * item.quantity : 0);
            }, 0)
            : 0
    };
}; 