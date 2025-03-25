"use client";

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
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg rounded-lg max-w-md mx-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle className="text-lg font-semibold">Confirm Deletion</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600">
            Are you sure you want to delete &quot;{itemName}&quot;? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 mt-4">
          <AlertDialogCancel 
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="error" 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
