"use client";

import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/lib/types";
import { GroupedInventoryItem } from "../types";

interface InventoryDebugControlsProps {
  isAddModalOpen: boolean;
  isDeleteModalOpen: boolean;
  currentItem: InventoryItem | null;
  setIsAddModalOpen: (isOpen: boolean) => void;
  openDeleteModal: (item: GroupedInventoryItem) => void;
  closeDeleteModal: () => void;
  items: InventoryItem[];
}

export function InventoryDebugControls({
  isAddModalOpen,
  isDeleteModalOpen,
  currentItem,
  setIsAddModalOpen,
  openDeleteModal,
  closeDeleteModal,
  items,
}: InventoryDebugControlsProps) {
  // Create a mock GroupedInventoryItem from a regular InventoryItem
  const createMockGroupedItem = (
    item: InventoryItem
  ): GroupedInventoryItem => ({
    ...item,
    ids: [item.id],
    totalQuantity: item.quantity,
    latestUpdate: item.updated_at,
    batchCount: 1,
    originalItems: [item],
  });

  const handleOpenAddModal = () => {
    console.log("DEBUG: Opening Add Modal");
    setIsAddModalOpen(true);
  };

  const handleOpenDeleteModal = () => {
    const firstItem = items.length > 0 ? items[0] : null;
    console.log("DEBUG: Items available:", items.length > 0);
    console.log("DEBUG: First item:", firstItem);

    if (firstItem) {
      console.log("DEBUG: Opening delete modal for:", firstItem.name);
      const groupedItem = createMockGroupedItem(firstItem);
      console.log("DEBUG: Created grouped item:", groupedItem);
      openDeleteModal(groupedItem);
    } else {
      console.log("DEBUG: No items available to delete");
    }
  };

  return (
    <div className="my-2 p-3 bg-purple-100 rounded-md border border-purple-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Debug Controls</h3>
        <div className="text-sm text-gray-500">
          <span className="mr-3">
            Add Modal: {isAddModalOpen ? "Open" : "Closed"}
          </span>
          <span>Delete Modal: {isDeleteModalOpen ? "Open" : "Closed"}</span>
          {currentItem && (
            <span className="ml-3">Current Item: {currentItem.name}</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Debug: Open Add Modal
        </Button>
        <Button
          onClick={handleOpenDeleteModal}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Debug: Open Delete Modal
        </Button>
        {isDeleteModalOpen && (
          <Button
            onClick={closeDeleteModal}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Debug: Close Delete Modal
          </Button>
        )}
      </div>
    </div>
  );
}
