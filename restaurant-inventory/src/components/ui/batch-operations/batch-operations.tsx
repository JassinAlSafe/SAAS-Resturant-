"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface BatchAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (selectedIds: string[]) => void | Promise<void>;
  variant?: "ghost" | "default" | "error" | "outline";
  requireConfirmation?: boolean;
  confirmationProps?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
}

interface BatchOperationsProps {
  selectedIds: string[];
  actions: BatchAction[];
  onClearSelection: () => void;
  selectionLabel?: string;
  position?: "top" | "bottom";
  className?: string;
}

export function BatchOperations({
  selectedIds = [],
  actions = [],
  onClearSelection,
  selectionLabel = "Items",
  position = "bottom",
  className = "",
}: BatchOperationsProps) {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    action: BatchAction | null;
    isOpen: boolean;
  }>({ action: null, isOpen: false });

  const handleActionClick = async (action: BatchAction) => {
    if (action.requireConfirmation) {
      setConfirmationDialog({ action, isOpen: true });
      return;
    }

    await executeAction(action);
  };

  const executeAction = async (action: BatchAction) => {
    try {
      setActionInProgress(action.id);
      await action.onClick(selectedIds);

      // If the action was successful and it was a confirmation dialog, close it
      if (confirmationDialog.action?.id === action.id) {
        setConfirmationDialog({ action: null, isOpen: false });
      }
    } catch (error) {
      console.error(`Error executing batch action ${action.id}:`, error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Early return if no items are selected or no actions are available
  if (!selectedIds?.length || !actions?.length) return null;

  const positionClasses =
    position === "bottom"
      ? "fixed bottom-4 left-1/2 transform -translate-x-1/2"
      : "fixed top-4 left-1/2 transform -translate-x-1/2";

  return (
    <>
      <div className={`${positionClasses} z-40 ${className}`}>
        <AnimatePresence>
          <motion.div
            initial={{ y: position === "bottom" ? 20 : -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: position === "bottom" ? 20 : -20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 px-3 flex items-center gap-3"
          >
            {/* Selection Count */}
            <div className="flex items-center px-2 text-sm text-gray-700 font-medium">
              <span>
                {selectedIds.length}{" "}
                {selectedIds.length === 1
                  ? selectionLabel
                  : `${selectionLabel}s`}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "ghost"}
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  disabled={!!actionInProgress}
                  className="h-8 text-sm text-gray-700 hover:bg-gray-100 rounded-md px-2"
                >
                  {React.createElement(action.icon, {
                    className: "h-4 w-4 mr-1.5",
                  })}
                  {action.label}
                </Button>
              ))}

              {/* Clear Selection Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={!!actionInProgress}
                className="h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      {confirmationDialog.action && (
        <Dialog
          open={confirmationDialog.isOpen}
          onOpenChange={(isOpen) =>
            setConfirmationDialog((prev) => ({ ...prev, isOpen }))
          }
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {confirmationDialog.action.confirmationProps?.title ||
                  confirmationDialog.action.label}
              </DialogTitle>
              {confirmationDialog.action.confirmationProps?.description && (
                <DialogDescription>
                  {confirmationDialog.action.confirmationProps.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmationDialog({ action: null, isOpen: false })
                }
                disabled={!!actionInProgress}
                className="border-gray-300"
              >
                {confirmationDialog.action.confirmationProps?.cancelLabel ||
                  "Cancel"}
              </Button>
              <Button
                variant={confirmationDialog.action.variant || "default"}
                onClick={() => {
                  if (confirmationDialog.action) {
                    executeAction(confirmationDialog.action);
                  }
                }}
                disabled={!!actionInProgress}
              >
                {actionInProgress === confirmationDialog.action.id
                  ? "Processing..."
                  : confirmationDialog.action.confirmationProps?.confirmLabel ||
                    "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
