import InventoryItemModal from "../modals/InventoryItemModal";
import DeleteConfirmationDialog from "@/components/inventory/DeleteConfirmationDialog";
import { InventoryItem, Supplier } from "@/lib/types";

type InventoryModalsProps = {
  isModalOpen: boolean;
  selectedItem?: InventoryItem;
  isDeleteDialogOpen: boolean;
  itemToDelete: InventoryItem | null;
  onCloseModal: () => void;
  onCloseDeleteDialog: () => void;
  onSaveItem: (
    itemData: Omit<InventoryItem, "id" | "created_at" | "updated_at">
  ) => void;
  onUpdateItem: (
    itemData: Omit<InventoryItem, "id" | "created_at" | "updated_at">
  ) => void;
  onDeleteItem: () => void;
  customCategories: string[];
  suppliers?: Supplier[];
  userRole?: "admin" | "manager" | "staff";
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
  suppliers = [],
  userRole = "staff",
}: InventoryModalsProps) {
  return (
    <>
      <InventoryItemModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={onSaveItem}
        onUpdate={onUpdateItem}
        item={selectedItem}
        customCategories={customCategories}
        suppliers={suppliers}
        userRole={userRole}
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
