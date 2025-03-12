"use client";

import { useState, useMemo } from "react";
import { InventoryItem } from "@/lib/types";

export function useInventoryTableState(items: InventoryItem[]) {
    const [compactMode, setCompactMode] = useState(false);
    const [sortField, setSortField] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Derive the sort configuration object for easier passing to components
    const sortConfig = useMemo(() => ({
        field: sortField,
        direction: sortDirection
    }), [sortField, sortDirection]);

    // Sort items based on current sort field and direction
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            let aValue = a[sortField as keyof InventoryItem];
            let bValue = b[sortField as keyof InventoryItem];

            // Handle nested properties
            if (sortField === "supplier_id") {
                aValue = a.supplier_id || "";
                bValue = b.supplier_id || "";
            }

            // Convert to lowercase strings for comparison
            const aString = String(aValue).toLowerCase();
            const bString = String(bValue).toLowerCase();

            // Sort based on direction
            return sortDirection === "asc"
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [items, sortField, sortDirection]);

    // Toggle expanded state for an item
    const toggleExpanded = (itemId: string) => {
        setExpandedItems((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    };

    // Handle sort field change
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Toggle selection for an item
    const toggleItemSelection = (itemId: string) => {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Toggle selection for all items
    const toggleAllItems = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((item) => item.id));
        }
    };

    return {
        compactMode,
        setCompactMode,
        sortField,
        sortDirection,
        sortConfig,
        setSortField,
        setSortDirection,
        expandedItems,
        setExpandedItems,
        selectedItems,
        setSelectedItems,
        toggleExpanded,
        handleSort,
        toggleItemSelection,
        toggleAllItems,
        sortedItems
    };
} 