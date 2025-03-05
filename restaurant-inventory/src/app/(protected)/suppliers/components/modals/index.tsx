"use client";

import { Supplier } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SupplierForm from "./SupplierForm";

interface SupplierModalsProps {
  isModalOpen: boolean;
  selectedSupplier: Supplier | null;
  isDeleteDialogOpen: boolean;
  supplierToDelete: Supplier | null;
  onCloseModal: () => void;
  onCloseDeleteDialog: () => void;
  onSaveSupplier: (
    data: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => void;
  onDeleteSupplier: () => void;
}

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
      <Dialog open={isModalOpen} onOpenChange={onCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? "Edit" : "Add"} Supplier
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            supplier={selectedSupplier ?? undefined}
            onSubmit={onSaveSupplier}
            onCancel={onCloseModal}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the supplier &quot;
              {supplierToDelete?.name}&quot; and all associated data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteSupplier}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
