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
import { SupplierForm } from "./SupplierForm";
import { FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";

interface SupplierModalsProps {
  isModalOpen: boolean;
  selectedSupplier: Supplier | null | undefined;
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
        <DialogContent
          className="max-w-4xl w-[95%] p-0 max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg border-t-4 border-orange-500 mx-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-3 border-b border-gray-100">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              {selectedSupplier ? "Edit" : "Add"} Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5">
            <SupplierForm
              supplier={selectedSupplier ?? undefined}
              onSubmit={onSaveSupplier}
              onCancel={onCloseModal}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
        <AlertDialogContent className="bg-white rounded-xl shadow-lg max-w-md mx-auto border-t-4 border-red-500 p-0">
          <AlertDialogHeader className="p-6">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500"
              >
                <FiAlertTriangle size={32} />
              </motion.div>
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 mt-2">
              This will permanently delete the supplier &quot;
              <span className="font-semibold">{supplierToDelete?.name}</span>
              &quot; and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center gap-3 p-6 pt-0">
            <AlertDialogCancel className="btn btn-outline border-gray-300 hover:bg-gray-100 hover:border-gray-300 px-6">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteSupplier}
              className="btn bg-red-500 hover:bg-red-600 text-white border-none px-6"
            >
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
