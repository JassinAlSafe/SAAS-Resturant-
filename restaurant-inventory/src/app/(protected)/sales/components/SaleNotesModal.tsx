"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { SaleEntry } from "../types";

interface SaleNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleEntry & {
    dishName: string;
  };
}

export default function SaleNotesModal({
  isOpen,
  onClose,
  sale,
}: SaleNotesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Item</h3>
            <p>{sale.dishName}</p>
          </div>
          <div>
            <h3 className="font-medium">Quantity</h3>
            <p>{sale.quantity}</p>
          </div>
          <div>
            <h3 className="font-medium">Total Amount</h3>
            <p>${sale.total_amount.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-medium">Date</h3>
            <p>{format(new Date(sale.date), "PPP")}</p>
          </div>
          <div>
            <h3 className="font-medium">Created At</h3>
            <p>{format(new Date(sale.created_at), "PPP p")}</p>
          </div>
          {sale.updated_at && (
            <div>
              <h3 className="font-medium">Last Updated</h3>
              <p>{format(new Date(sale.updated_at), "PPP p")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
