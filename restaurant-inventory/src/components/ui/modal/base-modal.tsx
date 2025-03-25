"use client";

import React, { useEffect, useRef } from "react";
import { Portal } from "../portal";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  position?: "top" | "middle" | "bottom" | "start" | "end";
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * A base modal component that leverages DaisyUI's modal styling with React Portal for proper DOM positioning.
 * This ensures modals are centered correctly regardless of page layout.
 */
export function BaseModal({
  isOpen,
  onClose,
  children,
  className,
  position = "middle",
  size = "md",
}: BaseModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // Handle escape key to close
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Control the dialog element's open state
  useEffect(() => {
    const dialogElement = dialogRef.current;

    // Open the dialog when isOpen changes to true
    if (isOpen && dialogElement) {
      try {
        if (!dialogElement.open) {
          dialogElement.showModal();
          // Prevent body scrolling when modal is open
          document.body.style.overflow = 'hidden';
        }
      } catch (error) {
        console.error("Error showing modal:", error);
      }
    }
    // Close the dialog when isOpen changes to false
    else if (dialogElement?.open) {
      dialogElement.close();
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
    }

    // Clean up by ensuring the dialog is closed when unmounted
    return () => {
      if (dialogElement?.open) {
        dialogElement.close();
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // Determine modal size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
    full: "max-w-[90vw] w-full",
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] overflow-y-auto">
        <dialog
          ref={dialogRef}
          className="modal modal-open"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          onClose={onClose}
          aria-modal="true"
          role="dialog"
        >
          <div
            className={cn(
              "modal-box shadow-lg",
              sizeClasses[size],
              position === "top" && "mt-16",
              position === "bottom" && "mb-16",
              position === "start" && "ml-16",
              position === "end" && "mr-16",
              className
            )}
          >
            {children}
          </div>

          {/* Modal backdrop - using daisyUI's modal-backdrop */}
          <form
            method="dialog"
            className="modal-backdrop bg-black bg-opacity-60"
          >
            <button type="button" onClick={onClose} className="cursor-default">
              close
            </button>
          </form>
        </dialog>
      </div>
    </Portal>
  );
}

export default BaseModal;
