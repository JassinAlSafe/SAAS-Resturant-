"use client";

import { useState, useCallback, useEffect } from "react";
import { InventoryItem } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { GroupedInventoryItem, InventoryFormData } from "@/app/(protected)/inventory/types";

export function useInventoryModals(
    addInventoryItem: (itemData: InventoryFormData) => Promise<InventoryItem | null>,
    updateInventoryItem: (id: string, itemData: InventoryFormData) => Promise<InventoryItem | null>,
    deleteInventoryItem: (id: string, name: string) => Promise<void>
) {
    const { toast } = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);

    // Log debugging information when component mounts
    useEffect(() => {
        console.log('useInventoryModals initialized with functions:', {
            addInventoryItem: !!addInventoryItem,
            updateInventoryItem: !!updateInventoryItem,
            deleteInventoryItem: !!deleteInventoryItem
        });
    }, [addInventoryItem, updateInventoryItem, deleteInventoryItem]);

    // Modal handlers
    const openAddModal = useCallback(() => {
        console.log('Opening add modal');
        setIsAddModalOpen(true);
    }, []);

    const closeAddModal = useCallback(() => {
        console.log('Closing add modal');
        setIsAddModalOpen(false);
    }, []);

    const openEditModal = useCallback((groupedItem: GroupedInventoryItem) => {
        console.log('Opening edit modal with item:', groupedItem);

        // Use the most recently updated item in the group for editing
        const mostRecentItem = groupedItem.originalItems.sort(
            (a: InventoryItem, b: InventoryItem) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];

        setCurrentItem(mostRecentItem);
        setIsEditModalOpen(true);
    }, []);

    const closeEditModal = useCallback(() => {
        console.log('Closing edit modal');
        setIsEditModalOpen(false);
    }, []);

    const openDeleteModal = useCallback((groupedItem: GroupedInventoryItem) => {
        console.log('Opening delete modal with item:', groupedItem);

        // For deletion, we'll use the first item in the group
        setCurrentItem(groupedItem.originalItems[0]);
        setIsDeleteModalOpen(true);
    }, []);

    const closeDeleteModal = useCallback(() => {
        console.log('Closing delete modal');
        setIsDeleteModalOpen(false);
    }, []);

    // Handle form submissions 
    const handleAddItem = useCallback(
        async (itemData: InventoryFormData) => {
            try {
                console.log("Adding item:", itemData);

                // Convert form data to the format expected by the API
                const apiData = {
                    name: itemData.name,
                    description: itemData.description,
                    category: itemData.category,
                    quantity: itemData.quantity || 0,
                    unit: itemData.unit,
                    cost: itemData.cost || 0,
                    reorder_level: itemData.reorder_level || 0,
                    supplier_id: itemData.supplier_id || undefined,
                    location: itemData.location || undefined,
                    expiry_date: itemData.expiry_date || undefined,
                    image_url: itemData.image_url || undefined,
                };

                // Call the addItem method from our store
                const result = await addInventoryItem(apiData);

                if (result) {
                    toast({
                        title: "Item Added",
                        description: `${itemData.name} has been added to inventory.`,
                    });
                    closeAddModal();
                    return result;
                } else {
                    throw new Error("Failed to add item");
                }
            } catch (error) {
                console.error("Error adding item:", error);
                toast({
                    title: "Error",
                    description: "Failed to add item. Please try again.",
                    variant: "destructive",
                });
                return null;
            }
        },
        [addInventoryItem, toast, closeAddModal]
    );

    const handleUpdateItem = useCallback(
        async (itemData: InventoryFormData) => {
            if (!currentItem) {
                console.error("No current item to update");
                return null;
            }

            try {
                console.log("Updating item:", currentItem.id, itemData);

                // Convert form data to the format expected by the API
                const apiData = {
                    name: itemData.name,
                    description: itemData.description,
                    category: itemData.category,
                    quantity: itemData.quantity || 0,
                    unit: itemData.unit,
                    cost: itemData.cost || 0,
                    reorder_level: itemData.reorder_level || 0,
                    supplier_id: itemData.supplier_id || undefined,
                    location: itemData.location || undefined,
                    expiry_date: itemData.expiry_date || undefined,
                    image_url: itemData.image_url || undefined,
                };

                // Call the updateItem method from our store
                const result = await updateInventoryItem(currentItem.id, apiData);

                if (result) {
                    toast({
                        title: "Item Updated",
                        description: `${itemData.name} has been updated.`,
                    });
                    closeEditModal();
                    return result;
                } else {
                    throw new Error("Failed to update item");
                }
            } catch (error) {
                console.error("Error updating item:", error);
                toast({
                    title: "Error",
                    description: "Failed to update item. Please try again.",
                    variant: "destructive",
                });
                return null;
            }
        },
        [currentItem, updateInventoryItem, toast, closeEditModal]
    );

    const handleDeleteItem = useCallback(
        async () => {
            if (!currentItem) {
                console.error("No current item to delete");
                return;
            }

            console.log("Deleting item:", currentItem);
            try {
                await deleteInventoryItem(currentItem.id, currentItem.name);
                closeDeleteModal();
            } catch (error) {
                console.error("Error deleting item:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete item. Please try again.",
                    variant: "destructive",
                });
            }
        },
        [currentItem, deleteInventoryItem, closeDeleteModal, toast]
    );

    return {
        isAddModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        currentItem,
        openAddModal,
        closeAddModal,
        openEditModal,
        closeEditModal,
        openDeleteModal,
        closeDeleteModal,
        handleAddItem,
        handleUpdateItem,
        handleDeleteItem,
    };
}