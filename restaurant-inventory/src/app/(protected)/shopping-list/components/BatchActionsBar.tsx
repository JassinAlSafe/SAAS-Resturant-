"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingListItem } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  ShoppingBag,
  Tag,
} from "lucide-react";
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

interface BatchActionsBarProps {
  selectedItems: ShoppingListItem[];
  onClearSelection: () => void;
  onMarkAllPurchased: (ids: string[]) => Promise<void>;
  onMarkAllUnpurchased: (ids: string[]) => Promise<void>;
  onDeleteAll: (ids: string[]) => Promise<void>;
  onMarkAllUrgent: (ids: string[]) => Promise<void>;
  onMarkAllNotUrgent: (ids: string[]) => Promise<void>;
  isProcessing: boolean;
}

export default function BatchActionsBar({
  selectedItems,
  onClearSelection,
  onMarkAllPurchased,
  onMarkAllUnpurchased,
  onDeleteAll,
  onMarkAllUrgent,
  onMarkAllNotUrgent,
  isProcessing,
}: BatchActionsBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get stats about selected items
  const totalSelected = selectedItems.length;
  const purchasedCount = selectedItems.filter(
    (item) => item.isPurchased
  ).length;
  const unpurchasedCount = totalSelected - purchasedCount;
  const urgentCount = selectedItems.filter((item) => item.isUrgent).length;
  const nonUrgentCount = totalSelected - urgentCount;

  // Get unique categories from selected items
  const categories = [...new Set(selectedItems.map((item) => item.category))];

  // Get ids of selected items
  const selectedIds = selectedItems.map((item) => item.id);

  // Function to handle purchase action
  const handlePurchaseAction = async () => {
    if (unpurchasedCount > 0) {
      // Only mark unpurchased items as purchased
      const unpurchasedIds = selectedItems
        .filter((item) => !item.isPurchased)
        .map((item) => item.id);
      await onMarkAllPurchased(unpurchasedIds);
    }
  };

  // Function to handle unpurchase action
  const handleUnpurchaseAction = async () => {
    if (purchasedCount > 0) {
      // Only mark purchased items as unpurchased
      const purchasedIds = selectedItems
        .filter((item) => item.isPurchased)
        .map((item) => item.id);
      await onMarkAllUnpurchased(purchasedIds);
    }
  };

  // Function to handle urgent action
  const handleUrgentAction = async () => {
    if (nonUrgentCount > 0) {
      // Only mark non-urgent items as urgent
      const nonUrgentIds = selectedItems
        .filter((item) => !item.isUrgent)
        .map((item) => item.id);
      await onMarkAllUrgent(nonUrgentIds);
    }
  };

  // Function to handle not urgent action
  const handleNotUrgentAction = async () => {
    if (urgentCount > 0) {
      // Only mark urgent items as not urgent
      const urgentIds = selectedItems
        .filter((item) => item.isUrgent)
        .map((item) => item.id);
      await onMarkAllNotUrgent(urgentIds);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 
          bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3
          flex items-center justify-between w-11/12 max-w-4xl"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-full text-sm">
            {totalSelected} selected
          </div>

          <div className="hidden md:flex items-center gap-2">
            {categories.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Tag className="h-3 w-3" />
                {categories.length === 1
                  ? categories[0]
                  : `${categories.length} categories`}
              </div>
            )}

            {purchasedCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {purchasedCount} purchased
              </div>
            )}

            {urgentCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                {urgentCount} urgent
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="p-1 h-auto text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
            <span className="ml-1 text-xs">Clear</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Purchase/Unpurchase actions */}
          {unpurchasedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePurchaseAction}
              disabled={isProcessing}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Mark as</span> Purchased
            </Button>
          )}

          {purchasedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnpurchaseAction}
              disabled={isProcessing}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Mark as</span> Unpurchased
            </Button>
          )}

          {/* Urgent/Not urgent actions */}
          {nonUrgentCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUrgentAction}
              disabled={isProcessing}
              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Mark as</span> Urgent
            </Button>
          )}

          {urgentCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotUrgentAction}
              disabled={isProcessing}
              className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            >
              <span className="hidden md:inline">Remove</span> Urgent
            </Button>
          )}

          {/* Delete action */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isProcessing}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Delete</span>
          </Button>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {totalSelected} item
              {totalSelected !== 1 ? "s" : ""} from your shopping list. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                onDeleteAll(selectedIds);
                setShowDeleteConfirm(false);
              }}
            >
              Delete {totalSelected} item{totalSelected !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
