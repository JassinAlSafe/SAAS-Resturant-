"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/modal/modal";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function DeleteConfirmationDialog({
  isOpen = false,
  onClose,
  onConfirm,
  itemName = "this item",
}: DeleteConfirmationDialogProps) {
  // Add debugging logs
  useEffect(() => {
    console.log("DeleteConfirmationDialog - isOpen:", isOpen);
    console.log("DeleteConfirmationDialog - itemName:", itemName);
  }, [isOpen, itemName]);

  const handleConfirm = () => {
    console.log("DeleteConfirmationDialog - Confirm delete");
    onConfirm();
  };

  const modalTitle = (
    <div className="flex items-center gap-2 text-gray-900">
      <AlertTriangle className="h-5 w-5 text-orange-500" />
      <h3 className="text-xl font-semibold">Confirm Deletion</h3>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      size="sm"
      className="min-h-[220px] w-full"
      footer={
        <ModalFooter
          onClose={onClose}
          onConfirm={handleConfirm}
          closeLabel="Cancel"
          confirmLabel="Delete"
          confirmVariant="error"
        />
      }
    >
      {/* Modal requires children, even if empty */}
      <div className="min-h-[60px] flex items-center justify-center">
        <div className="text-gray-500 text-sm">
          This will permanently remove the item from your inventory.
        </div>
      </div>
    </Modal>
  );
}
