"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash, 
  FileDown, 
  Tag, 
  Truck, 
  ChevronDown,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency";

interface BatchOperationsProps {
  selectedItems: string[];
  items: InventoryItem[];
  onClearSelection: () => void;
  onDeleteSelected: (itemIds: string[]) => Promise<void>;
  onUpdateCategory: (itemIds: string[], category: string) => Promise<void>;
  onExportSelected: (itemIds: string[]) => void;
}

export function BatchOperations({
  selectedItems,
  items,
  onClearSelection,
  onDeleteSelected,
  onUpdateCategory,
  onExportSelected,
}: BatchOperationsProps) {
  const { formatCurrency } = useCurrency();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState<boolean | null>(null);
  const [operationMessage, setOperationMessage] = useState("");

  // Get the selected items data
  const selectedItemsData = items.filter(item => 
    selectedItems.includes(item.id)
  );

  // Calculate total value of selected items
  const totalValue = selectedItemsData.reduce(
    (sum, item) => sum + (item.cost_per_unit || 0) * item.quantity,
    0
  );

  const handleDeleteConfirm = async () => {
    try {
      setIsProcessing(true);
      await onDeleteSelected(selectedItems);
      setOperationSuccess(true);
      setOperationMessage(`Successfully deleted ${selectedItems.length} items`);
      setIsDeleteDialogOpen(false);
      onClearSelection();
    } catch (error) {
      setOperationSuccess(false);
      setOperationMessage("Failed to delete items. Please try again.");
    } finally {
      setIsProcessing(false);
      // Reset success message after 3 seconds
      setTimeout(() => {
        setOperationSuccess(null);
        setOperationMessage("");
      }, 3000);
    }
  };

  const handleExport = () => {
    onExportSelected(selectedItems);
    setOperationSuccess(true);
    setOperationMessage(`Exported ${selectedItems.length} items`);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setOperationSuccess(null);
      setOperationMessage("");
    }, 3000);
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4"
        >
          <div className="text-sm font-medium">
            <span className="text-muted-foreground">Selected:</span>{" "}
            <span className="font-bold">{selectedItems.length} items</span>
            {totalValue > 0 && (
              <span className="ml-2 text-muted-foreground">
                (Total value: {formatCurrency(totalValue)})
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="text-xs"
            >
              Clear
            </Button>
            
            <Button
              variant="error"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-xs"
            >
              <Trash className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-xs"
            >
              <FileDown className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  More Actions
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Tag className="h-4 w-4 mr-2" />
                  Update Category
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Truck className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark as Low Stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Success/Error Message */}
          {operationSuccess !== null && (
            <div 
              className={`ml-2 text-sm flex items-center ${
                operationSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {operationSuccess ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <X className="h-4 w-4 mr-1" />
              )}
              {operationMessage}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedItems.length} items?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the selected inventory items.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="max-h-40 overflow-y-auto">
              <ul className="list-disc pl-5 space-y-1">
                {selectedItemsData.slice(0, 5).map(item => (
                  <li key={item.id} className="text-sm">
                    {item.name} ({item.quantity} {item.unit})
                  </li>
                ))}
                {selectedItemsData.length > 5 && (
                  <li className="text-sm text-muted-foreground">
                    ...and {selectedItemsData.length - 5} more items
                  </li>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
