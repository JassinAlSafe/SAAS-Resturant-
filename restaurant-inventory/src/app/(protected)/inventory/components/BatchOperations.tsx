"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash,
  ChevronDown,
  AlertTriangle,
  Check,
  X,
  FileText,
  File,
  FilePlus,
  Download,
  CheckSquare,
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
  onUpdateCategory?: (itemIds: string[], category: string) => Promise<void>;
  onExportSelected: (itemIds: string[]) => void;
}

export function BatchOperations({
  selectedItems,
  items,
  onClearSelection,
  onDeleteSelected,
  onExportSelected,
}: BatchOperationsProps) {
  const { formatCurrency } = useCurrency();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState<boolean | null>(
    null
  );
  const [operationMessage, setOperationMessage] = useState("");

  // Get the selected items data
  const selectedItemsData = items.filter((item) =>
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
    } catch (err) {
      console.error("Error deleting items:", err);
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

  const handleExportAction = (type?: string) => {
    onExportSelected(selectedItems);
    setOperationSuccess(true);
    setOperationMessage(
      type ? `Exported as ${type}` : `Exported ${selectedItems.length} items`
    );

    setTimeout(() => {
      setOperationSuccess(null);
      setOperationMessage("");
    }, 3000);
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-auto">
      <AnimatePresence>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 px-5 py-3.5 flex items-center gap-4 max-w-[95vw] w-auto"
          style={{ minWidth: "420px" }}
        >
          {/* Selection Info with Icon */}
          <div className="flex items-center text-sm font-medium">
            <div className="mr-3 bg-blue-100 text-blue-700 rounded-full p-1.5">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-bold text-gray-900">
                  {selectedItems.length}{" "}
                  {selectedItems.length === 1 ? "item" : "items"}
                </span>
                <span className="mx-1.5 text-gray-400">•</span>
                <span className="text-orange-600 font-medium">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Selected for batch operations
              </div>
            </div>
          </div>

          {/* Status Message - Animated appearance */}
          <AnimatePresence>
            {operationSuccess !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`text-xs flex items-center rounded-full px-3 py-1.5 ${
                  operationSuccess
                    ? "text-green-700 bg-green-50 border border-green-100"
                    : "text-red-700 bg-red-50 border border-red-100"
                }`}
              >
                {operationSuccess ? (
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                ) : (
                  <X className="h-3.5 w-3.5 mr-1.5" />
                )}
                {operationMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer to push buttons to the right */}
          <div className="flex-grow"></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm bg-white border-gray-300 hover:bg-gray-50 text-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 p-1.5" align="end">
                <DropdownMenuItem
                  className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100"
                  onClick={() => handleExportAction("CSV")}
                >
                  <FileText className="h-4 w-4 mr-2.5 text-blue-600" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100"
                  onClick={() => handleExportAction("JSON")}
                >
                  <File className="h-4 w-4 mr-2.5 text-green-600" />
                  <span>Export as JSON</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100"
                  onClick={() => handleExportAction("PDF")}
                >
                  <FilePlus className="h-4 w-4 mr-2.5 text-red-600" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-9 px-3 text-sm bg-red-600 hover:bg-red-700 text-white border-none"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>

            {/* Clear Selection Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="h-9 px-3 text-sm border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Delete {selectedItems.length} items
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              This action cannot be undone. These items will be permanently
              removed from your inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <p>
              Deleting these items will also remove all associated transaction
              history and cannot be recovered.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-pulse mr-2">•••</span>
                  Deleting
                </>
              ) : (
                "Delete Items"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
