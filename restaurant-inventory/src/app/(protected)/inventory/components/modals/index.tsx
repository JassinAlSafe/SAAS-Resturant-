import InventoryItemModal from "@/components/inventory/InventoryItemModal";
import DeleteConfirmationDialog from "@/components/inventory/DeleteConfirmationDialog";
import { InventoryItem } from "@/lib/types";

type InventoryModalsProps = {
  isModalOpen: boolean;
  selectedItem?: InventoryItem;
  isDeleteDialogOpen: boolean;
  itemToDelete: InventoryItem | null;
  onCloseModal: () => void;
  onCloseDeleteDialog: () => void;
  onSaveItem: (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => void;
  onUpdateItem: (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => void;
  onDeleteItem: () => void;
  customCategories: string[];
};

export function InventoryModals({
  isModalOpen,
  selectedItem,
  isDeleteDialogOpen,
  itemToDelete,
  onCloseModal,
  onCloseDeleteDialog,
  onSaveItem,
  onUpdateItem,
  onDeleteItem,
  customCategories,
}: InventoryModalsProps) {
  return (
    <>
      <InventoryItemModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={selectedItem ? onUpdateItem : onSaveItem}
        item={selectedItem}
        customCategories={customCategories}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={onDeleteItem}
        itemName={itemToDelete?.name || ""}
        itemType="item"
      />
    </>
  );
}
