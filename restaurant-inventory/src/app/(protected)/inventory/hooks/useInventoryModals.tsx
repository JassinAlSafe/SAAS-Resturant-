import { useState, useCallback } from "react";
import { InventoryItem, InventoryFormData } from "@/lib/types";

type AddItemFn = (data: InventoryFormData) => Promise<InventoryItem | null>;
type UpdateItemFn = (
  id: string,
  data: Partial<InventoryFormData>
) => Promise<InventoryItem | null>;
type DeleteItemFn = (id: string) => Promise<void | boolean>;

export function useInventoryModals(
  addItem: AddItemFn,
  updateItem: UpdateItemFn,
  deleteItem: DeleteItemFn
) {
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);

  // Open modal for adding a new item
  const openAddModal = useCallback(() => {
    console.log("Opening add modal");
    setCurrentItem(null);
    setIsAddModalOpen(true);
  }, []);

  // Open modal for editing an item
  const openEditModal = useCallback((item: InventoryItem) => {
    console.log("Opening edit modal for item:", item.id);
    setCurrentItem(item);
    setIsEditModalOpen(true);
  }, []);

  // Open delete confirmation dialog
  const openDeleteModal = useCallback((item: InventoryItem) => {
    console.log("Opening delete modal for item:", item.id);
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  }, []);

  // Close item modals
  const closeAddModal = useCallback(() => {
    console.log("Closing add modal");
    setIsAddModalOpen(false);
  }, []);

  const closeEditModal = useCallback(() => {
    console.log("Closing edit modal");
    setIsEditModalOpen(false);
    setCurrentItem(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    console.log("Closing delete modal");
    setIsDeleteModalOpen(false);
    setCurrentItem(null);
  }, []);

  // Handle form submissions
  const handleAddItem = useCallback(
    async (formData: InventoryFormData) => {
      console.log("Adding item:", formData);
      try {
        const newItem = await addItem(formData);
        if (newItem) {
          closeAddModal();
          return newItem;
        }
      } catch (error) {
        console.error("Error adding item:", error);
      }
      return null;
    },
    [addItem, closeAddModal]
  );

  const handleUpdateItem = useCallback(
    async (formData: InventoryFormData) => {
      if (!currentItem) return null;

      console.log("Updating item:", currentItem.id, formData);
      try {
        const updatedItem = await updateItem(currentItem.id, formData);
        if (updatedItem) {
          closeEditModal();
          return updatedItem;
        }
      } catch (error) {
        console.error("Error updating item:", error);
      }
      return null;
    },
    [currentItem, updateItem, closeEditModal]
  );

  const handleDeleteItem = useCallback(async () => {
    if (!currentItem) return false;

    console.log("Deleting item:", currentItem.id);
    try {
      const success = await deleteItem(currentItem.id);
      if (success) {
        closeDeleteModal();
        return true;
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
    return false;
  }, [currentItem, deleteItem, closeDeleteModal]);

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
