"use client";

import { useState } from "react";
import { Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import EntityNotes from "@/app/(protected)/notes/EntityNotes";

interface SaleNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
}

export default function SaleNotesModal({
  isOpen,
  onClose,
  sale,
}: SaleNotesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            Notes for Sale on {format(new Date(sale.date), "PPP")}
          </DialogTitle>
          <DialogDescription>
            {sale.dishName || "Unknown Dish"} - Quantity: {sale.quantity} -
            Total: {sale.totalAmount}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <EntityNotes
            entityType="sale"
            entityId={sale.id}
            entityName={`${sale.dishName || "Unknown Dish"} (${format(
              new Date(sale.date),
              "PPP"
            )})`}
          />
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
