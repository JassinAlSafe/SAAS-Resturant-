"use client";

import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/ui/modal/base-modal";

export type DeleteConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  itemType?: string;
  title?: string;
  description?: string;
};

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "inventory item",
  title,
  description,
}: DeleteConfirmationDialogProps) {
  // Default title and description if not provided
  const dialogTitle = title || "Are you sure?";
  const dialogDescription =
    description ||
    `This will permanently delete the ${itemType} ${
      itemName ? `<strong>${itemName}</strong>` : ""
    }.
     This action cannot be undone.`;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="sm" position="middle">
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2">{dialogTitle}</h3>

        {description ? (
          <p className="py-4 text-sm text-gray-600">{description}</p>
        ) : (
          <p className="py-4 text-sm text-gray-600">
            This will permanently delete the {itemType}{" "}
            <strong>{itemName}</strong>. This action cannot be undone.
          </p>
        )}

        <div className="modal-action flex justify-end mt-6">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
