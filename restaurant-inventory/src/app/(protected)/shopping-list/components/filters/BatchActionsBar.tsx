"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  ShoppingBag,
  Tag,
  ChevronDown,
} from "lucide-react";
import { ShoppingListItem } from "@/lib/types";
import { motion } from "framer-motion";

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
  const [isMobile, setIsMobile] = useState(false);

  // Add useEffect to detect mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

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
          rounded-xl bg-primary text-primary-content shadow-lg p-4
          flex items-center justify-between w-11/12 max-w-4xl"
      >
        <div className="flex items-center gap-3">
          <div className="badge badge-accent badge-lg">
            {totalSelected} selected
          </div>

          {!isMobile && (
            <div className="hidden md:flex items-center gap-3">
              {categories.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {categories.length === 1
                    ? categories[0]
                    : `${categories.length} categories`}
                </div>
              )}

              {purchasedCount > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  {purchasedCount} purchased
                </div>
              )}

              {urgentCount > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  {urgentCount} urgent
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClearSelection}
            className="btn btn-ghost btn-sm text-primary-content"
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
            <span className="ml-1">Clear</span>
          </button>
        </div>

        {isMobile ? (
          // Mobile layout - dropdown menu for actions
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-accent btn-md"
              disabled={isProcessing}
            >
              Actions
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu bg-base-100 text-base-content rounded-box p-2 shadow-lg mt-1 w-56"
            >
              {unpurchasedCount > 0 && (
                <li>
                  <button
                    onClick={handlePurchaseAction}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Mark as Purchased
                  </button>
                </li>
              )}

              {purchasedCount > 0 && (
                <li>
                  <button
                    onClick={handleUnpurchaseAction}
                    disabled={isProcessing}
                  >
                    <ShoppingBag className="h-4 w-4 text-accent" />
                    Mark as Unpurchased
                  </button>
                </li>
              )}

              {nonUrgentCount > 0 && (
                <li>
                  <button onClick={handleUrgentAction} disabled={isProcessing}>
                    <AlertCircle className="h-4 w-4 text-warning" />
                    Mark as Urgent
                  </button>
                </li>
              )}

              {urgentCount > 0 && (
                <li>
                  <button
                    onClick={handleNotUrgentAction}
                    disabled={isProcessing}
                  >
                    <AlertCircle className="h-4 w-4 text-base-content/40" />
                    Mark as Not Urgent
                  </button>
                </li>
              )}

              <li className="menu-title">
                <span>Danger Zone</span>
              </li>

              <li>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isProcessing}
                  className="text-error"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              </li>
            </ul>
          </div>
        ) : (
          // Desktop layout - button row
          <div className="flex items-center gap-2">
            {/* Purchase/Unpurchase actions */}
            <div className="join">
              {unpurchasedCount > 0 && (
                <button
                  onClick={handlePurchaseAction}
                  className="btn btn-md join-item bg-primary-focus border-primary-focus text-primary-content hover:bg-primary-focus"
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="h-4 w-4 text-accent mr-1" />
                  <span className="hidden sm:inline">Mark Purchased</span>
                </button>
              )}

              {purchasedCount > 0 && (
                <button
                  onClick={handleUnpurchaseAction}
                  className="btn btn-md join-item bg-primary-focus border-primary-focus text-primary-content hover:bg-primary-focus"
                  disabled={isProcessing}
                >
                  <ShoppingBag className="h-4 w-4 text-accent mr-1" />
                  <span className="hidden sm:inline">Mark Unpurchased</span>
                </button>
              )}
            </div>

            {/* Urgent/Not Urgent actions */}
            <div className="join">
              {nonUrgentCount > 0 && (
                <button
                  onClick={handleUrgentAction}
                  className="btn btn-md join-item bg-primary-focus border-primary-focus text-primary-content hover:bg-primary-focus"
                  disabled={isProcessing}
                >
                  <AlertCircle className="h-4 w-4 text-warning mr-1" />
                  <span className="hidden sm:inline">Mark Urgent</span>
                </button>
              )}

              {urgentCount > 0 && (
                <button
                  onClick={handleNotUrgentAction}
                  className="btn btn-md join-item bg-primary-focus border-primary-focus text-primary-content hover:bg-primary-focus"
                  disabled={isProcessing}
                >
                  <AlertCircle className="h-4 w-4 opacity-75 mr-1" />
                  <span className="hidden sm:inline">Mark Not Urgent</span>
                </button>
              )}
            </div>

            {/* Delete action */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-md btn-error"
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "item" : "items"}? This cannot be
              undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  onDeleteAll(selectedIds);
                  setShowDeleteConfirm(false);
                }}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
        </div>
      )}
    </>
  );
}
