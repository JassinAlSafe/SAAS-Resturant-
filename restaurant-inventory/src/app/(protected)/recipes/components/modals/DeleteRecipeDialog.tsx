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

interface DeleteRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipeName: string;
}

export default function DeleteRecipeDialog({
  isOpen,
  onClose,
  onConfirm,
  recipeName,
}: DeleteRecipeDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete \"{recipeName}\"? This
            action cannot be undone, and the recipe will be permanently removed
            from your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
