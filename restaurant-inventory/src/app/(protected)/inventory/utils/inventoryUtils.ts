"use client";

import { InventoryItem } from "@/lib/types";
import { GroupedInventoryItem } from "../types";

/**
 * Group similar inventory items together
 */
export function groupInventoryItems(items: InventoryItem[]): GroupedInventoryItem[] {
    // Create a map to group items by a combination of name and category
    const groupMap = new Map<string, GroupedInventoryItem>();

    items.forEach((item) => {
        // Create a unique key for grouping (adjust this based on what makes items "the same")
        const groupKey = `${item.name.toLowerCase()}_${item.category.toLowerCase()}`;

        if (!groupMap.has(groupKey)) {
            // Create a new group with this item as the first entry
            groupMap.set(groupKey, {
                ...item,
                ids: [item.id],
                totalQuantity: item.quantity,
                latestUpdate: item.updated_at,
                batchCount: 1,
                originalItems: [item],
            });
        } else {
            // Add this item to an existing group
            const group = groupMap.get(groupKey)!;
            group.ids.push(item.id);
            group.totalQuantity += item.quantity;
            group.batchCount += 1;

            // Keep track of the most recent update
            if (new Date(item.updated_at) > new Date(group.latestUpdate)) {
                group.latestUpdate = item.updated_at;
            }

            group.originalItems.push(item);
        }
    });

    // Convert the map back to an array for display
    return Array.from(groupMap.values());
}

/**
 * Check if a grouped item is low on stock
 */
export function isGroupLowStock(item: GroupedInventoryItem): boolean {
    const reorderLevel = item.reorder_level || 5;
    return item.totalQuantity <= reorderLevel && item.totalQuantity > 0;
}

/**
 * Check if a grouped item is out of stock
 */
export function isGroupOutOfStock(item: GroupedInventoryItem): boolean {
    return item.totalQuantity <= 0;
}

/**
 * Calculate total inventory value
 */
export function calculateInventoryValue(items: GroupedInventoryItem[]): number {
    return items.reduce((total, item) => {
        return total + item.totalQuantity * item.cost;
    }, 0);
}

/**
 * Convert grouped items to a display-friendly format
 */
export function convertToDisplayItems(groupedItems: GroupedInventoryItem[]): InventoryItem[] {
    return groupedItems.map((group) => ({
        ...group,
        id: group.ids[0], // Using first ID for compatibility
        quantity: group.totalQuantity,
        updated_at: group.latestUpdate,
    })) as InventoryItem[];
}