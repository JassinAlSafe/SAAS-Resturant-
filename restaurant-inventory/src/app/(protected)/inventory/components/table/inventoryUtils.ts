import { InventoryItem, GroupedInventoryItem } from "@/lib/types";

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

// Check if item is out of stock
export const isOutOfStock = (item: InventoryItem): boolean => {
    return item.quantity <= 0;
};

// Check if item is low on stock
export const isLowStock = (item: InventoryItem): boolean => {
    // If we have a reorder point or minimum stock level, use that
    if (
        (item.reorder_point && item.quantity <= item.reorder_point) ||
        (item.minimum_stock_level && item.quantity <= item.minimum_stock_level)
    ) {
        return true;
    }

    // Default threshold is 20% of max stock if defined, otherwise 5 units
    const maxStock = item.max_stock || 25;
    const threshold = Math.max(5, maxStock * 0.2);
    return item.quantity <= threshold;
};

// Get reorder level if not provided
export const getReorderLevel = (item: InventoryItem): number => {
    // If we have a reorder point or minimum stock level, use that
    if (item.reorder_point) {
        return item.reorder_point;
    }
    if (item.minimum_stock_level) {
        return item.minimum_stock_level;
    }

    // Default threshold is 20% of max stock if defined, otherwise 5 units
    const maxStock = item.max_stock || 25;
    return Math.max(5, maxStock * 0.2);
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
    if (isOutOfStock(item)) {
        return "text-error border-error/30 bg-error/10";
    }
    if (isLowStock(item)) {
        return "text-warning border-warning/30 bg-warning/10";
    }
    return "text-success border-success/30 bg-success/10";
};

// Calculate cost per unit
export const calculateCostPerUnit = (item: InventoryItem): number => {
    if (item.quantity <= 0 || !item.cost_per_unit) {
        return 0;
    }
    return item.cost_per_unit;
};

// Calculate total inventory value
export const calculateInventoryValue = (items: GroupedInventoryItem[]): number => {
    return items.reduce((total, item) => {
        return total + item.totalQuantity * item.cost;
    }, 0);
};

// Calculate inventory statistics
export const calculateInventoryStats = (
    items: InventoryItem[],
    selectedItems: string[]
) => {
    return {
        totalItems: items.length,
        totalValue: items.reduce((total, item) => {
            const itemValue = item.quantity * (item.cost_per_unit || 0);
            return total + itemValue;
        }, 0),
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
                return sum + (item ? calculateCostPerUnit(item) * item.quantity : 0);
            }, 0)
            : 0
    };
};