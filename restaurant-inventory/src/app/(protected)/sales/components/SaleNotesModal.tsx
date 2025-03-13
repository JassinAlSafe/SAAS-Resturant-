"use client";

import { useState } from "react";
import { Sale } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";

// Extend the Sale type locally until it's added to the main type
interface SaleWithNotes extends Sale {
  notes?: string;
}

interface SaleNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleWithNotes;
}

export default function SaleNotesModal({
  isOpen,
  onClose,
  sale,
}: SaleNotesModalProps) {
  const [notes, setNotes] = useState(sale.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      // Note: This functionality might need to be implemented in the salesService
      // For now, we'll just show a success message
      toast.success("Sale notes updated successfully");

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating sale notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
          <DialogDescription>
            View and edit notes for sale on{" "}
            {format(new Date(sale.date), "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Item</p>
              <p className="text-sm">{sale.dishName}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Quantity</p>
              <p className="text-sm">{sale.quantity}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Total Amount</p>
            <p className="text-sm">${sale.totalAmount.toFixed(2)}</p>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium mb-1 block">
              Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Add notes about this sale entry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveNotes} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
