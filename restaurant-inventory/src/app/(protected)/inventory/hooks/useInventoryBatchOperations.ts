"use client";

import { useState, useCallback, useMemo } from "react";
import { InventoryItem } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Trash, Download } from "lucide-react";
import { BatchAction } from "@/components/ui/batch-operations/batch-operations";

export function useInventoryBatchOperations(
    items: InventoryItem[],
    deleteInventoryItem: (id: string, name: string) => Promise<void | boolean>
) {
    const { toast } = useToast();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleItemSelection = useCallback((itemId: string) => {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    }, []);

    const toggleAllItems = useCallback(
        (itemIds: string[]) => {
            console.log("toggleAllItems called with:", itemIds);
            if (itemIds.length === 0) {
                console.log("No items to toggle, clearing selection");
                setSelectedItems([]);
                return;
            }

            if (selectedItems.length === itemIds.length) {
                console.log("All items already selected, clearing selection");
                setSelectedItems([]);
            } else {
                console.log("Selecting all items:", itemIds);
                setSelectedItems(itemIds);
            }
        },
        [selectedItems.length]
    );

    const clearSelection = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const handleDeleteSelected = useCallback(
        async (itemIds: string[]) => {
            try {
                // Delete each item one by one
                for (const itemId of itemIds) {
                    const item = items.find((i) => i.id === itemId);
                    if (item) {
                        await deleteInventoryItem(itemId, item.name);
                    }
                }

                toast({
                    title: "Success",
                    description: `Deleted ${itemIds.length} items successfully`,
                    variant: "default",
                });

                // Clear selection after successful deletion
                setSelectedItems([]);
                return Promise.resolve();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete selected items",
                    variant: "destructive",
                });
                return Promise.reject(error);
            }
        },
        [items, deleteInventoryItem, toast]
    );

    const handleExportSelected = useCallback((itemIds: string[]) => {
        const selectedData = items.filter((item) => itemIds.includes(item.id));

        // Convert to CSV
        const headers = [
            "Name",
            "Category",
            "Quantity",
            "Unit",
            "Cost",
            "Reorder Level",
        ];
        const csvContent = [
            headers.join(","),
            ...selectedData.map((item) =>
                [
                    item.name,
                    item.category,
                    item.quantity,
                    item.unit,
                    item.cost,
                    item.reorder_level,
                ].join(",")
            ),
        ].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `inventory_export_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [items]);

    // Define batch actions
    const batchActions = useMemo<BatchAction[]>(
        () => [
            {
                id: "delete",
                label: "Delete",
                icon: Trash,
                variant: "error",
                requireConfirmation: true,
                confirmationProps: {
                    title: "Delete Selected Items",
                    description:
                        "Are you sure you want to delete these items? This action cannot be undone.",
                    confirmLabel: "Delete",
                    cancelLabel: "Cancel",
                },
                onClick: handleDeleteSelected,
            },
            {
                id: "export",
                label: "Export",
                icon: Download,
                variant: "ghost",
                onClick: handleExportSelected,
            },
        ],
        [handleDeleteSelected, handleExportSelected]
    );

    return {
        selectedItems,
        toggleItemSelection,
        toggleAllItems,
        clearSelection,
        batchActions,
    };
} 