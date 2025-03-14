"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingListItem } from "@/lib/types";
import { ShoppingListForm } from "./ShoppingListForm";

interface ShoppingListModalsProps {
  selectedItem: ShoppingListItem | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  onCloseAddModal: () => void;
  onCloseEditModal: () => void;
  onAdd: (
    item: Omit<
      ShoppingListItem,
      "id" | "added_at" | "purchased_at" | "business_profile_id" | "user_id"
    >
  ) => Promise<void>;
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
  // Adapter function to convert form data to the expected ShoppingListItem format
  const handleAddSubmit = async (formData: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    estimated_cost: number;
    notes?: string;
  }) => {
    await onAdd({
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      category: formData.category,
      estimated_cost: formData.estimated_cost,
      notes: formData.notes,
      is_purchased: false,
      is_auto_generated: false,
    });
  };

  // Adapter function to convert form data to updates for an existing item
  const handleUpdateSubmit = async (formData: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    estimated_cost: number;
    notes?: string;
  }) => {
    await onUpdate({
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      category: formData.category,
      estimated_cost: formData.estimated_cost,
      notes: formData.notes,
    });
  };

  return (
    <>
      <Dialog open={isAddModalOpen} onOpenChange={onCloseAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Shopping List Item</DialogTitle>
          </DialogHeader>
          <ShoppingListForm
            onSubmit={handleAddSubmit}
            categories={categories}
            isSubmitting={isSubmitting}
            onCancel={onCloseAddModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={onCloseEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Shopping List Item</DialogTitle>
          </DialogHeader>
          <ShoppingListForm
            initialData={selectedItem}
            onSubmit={handleUpdateSubmit}
            categories={categories}
            isSubmitting={isSubmitting}
            onCancel={onCloseEditModal}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
