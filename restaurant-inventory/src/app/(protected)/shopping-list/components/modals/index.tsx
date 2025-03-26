"use client";

import { ShoppingListItem } from "@/lib/types";
import AddItemModal from "./AddItemModal";

interface ShoppingListModalsProps {
  selectedItem: ShoppingListItem | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  onCloseAddModal: () => void;
  onCloseEditModal: () => void;
  onAdd: (item: Partial<ShoppingListItem>) => Promise<void>;
  onUpdate: (updates: Partial<ShoppingListItem>) => Promise<void>;
  categories: string[];
  isSubmitting: boolean;
}

export default function ShoppingListModals({
  selectedItem,
  isAddModalOpen,
  isEditModalOpen,
  onCloseAddModal,
  onCloseEditModal,
  onAdd,
  onUpdate,
  categories,
  isSubmitting,
}: ShoppingListModalsProps) {
  // Handler for editing items
  const handleEditItem = async (item: Partial<ShoppingListItem>) => {
    if (selectedItem) {
      await onUpdate(item);
    }
  };

  return (
    <>
      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onAddItem={onAdd}
        categories={categories}
        isAddingItem={isSubmitting}
      />

      {/* Edit Item Modal */}
      {selectedItem && (
        <AddItemModal
          isOpen={isEditModalOpen}
          onClose={onCloseEditModal}
          onAddItem={handleEditItem}
          categories={categories}
          isAddingItem={isSubmitting}
          initialData={selectedItem}
        />
      )}
    </>
  );
}
