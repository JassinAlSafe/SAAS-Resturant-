"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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

  // Using daisy UI modal
  return (
    <dialog
      id="delete_confirmation_dialog"
      className={`modal ${isOpen ? "modal-open" : ""}`}
      onClose={onClose}
    >
      <div className="modal-box bg-white max-w-md">
        <div className="flex items-center gap-2 text-orange-500 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-xl font-semibold text-gray-900">
            Confirm Deletion
          </h3>
        </div>
        <p className="text-gray-600 py-4">
          Are you sure you want to delete &quot;{itemName}&quot;? This action
          cannot be undone.
        </p>
        <div className="modal-action flex justify-end mt-4">
          <Button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-orange-500 hover:bg-orange-600 text-white border-0"
          >
            Delete
          </Button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
