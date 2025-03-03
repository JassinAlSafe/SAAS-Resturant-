import { useState } from "react";
import { InventoryItem } from "@/lib/types";

export function useInventoryModals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(
    undefined
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Open modal for adding a new item
  const openAddModal = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  // Open modal for editing an item
  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Close item modal
  const closeItemModal = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return {
    isModalOpen,
    selectedItem,
    isDeleteDialogOpen,
    itemToDelete,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    closeItemModal,
    closeDeleteDialog,
  };
}
