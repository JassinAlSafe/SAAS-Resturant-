"use client";

import { Supplier } from "@/lib/types";
import SupplierModal from "@/components/suppliers/SupplierModal";
import DeleteConfirmationDialog from "@/components/inventory/DeleteConfirmationDialog";

type SupplierModalsProps = {
  isModalOpen: boolean;
  selectedSupplier?: Supplier;
  isDeleteDialogOpen: boolean;
  supplierToDelete: Supplier | null;
  onCloseModal: () => void;
  onCloseDeleteDialog: () => void;
  onSaveSupplier: (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => void;
  onDeleteSupplier: () => void;
};

export function SupplierModals({
  isModalOpen,
  selectedSupplier,
  isDeleteDialogOpen,
  supplierToDelete,
  onCloseModal,
  onCloseDeleteDialog,
  onSaveSupplier,
  onDeleteSupplier,
}: SupplierModalsProps) {
  return (
    <>
      <SupplierModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={onSaveSupplier}
        supplier={selectedSupplier}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={onDeleteSupplier}
        itemName={supplierToDelete?.name || ""}
      />
    </>
  );
}
