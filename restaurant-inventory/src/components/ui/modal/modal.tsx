"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/ui/modal/base-modal";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showClose?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "top" | "middle" | "bottom" | "start" | "end";
  hideCloseIcon?: boolean;
}

interface ModalSectionProps {
  title?: string | React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export function ModalSection({
  title,
  icon,
  children,
  className,
  divider = false,
}: ModalSectionProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        divider && "border-b border-gray-100 pb-6 mb-6",
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2.5 text-gray-900">
          {icon && <div className="text-gray-500">{icon}</div>}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  showClose = true,
  className,
  size = "lg",
  position = "middle",
  hideCloseIcon = false,
}: ModalProps) {
  // Handle ESC key press
  React.useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      position={position}
      className={cn("p-0 bg-white overflow-hidden rounded-lg", className)}
    >
      {!hideCloseIcon && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="px-6 pt-6 pb-2">
        <div className="mb-6">
          {typeof title === 'string' ? (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          ) : (
            title
          )}
          {description && (
            <p className="text-base text-gray-600 mt-2">{description}</p>
          )}
        </div>

        <div className="grid gap-6">{children}</div>
      </div>

      {(footer || showClose) && (
        <div className="flex px-6 py-4 mt-4 bg-gray-50 border-t border-gray-100">
          <div className="w-full flex justify-end gap-3">
            {footer || (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 px-4 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      )}
    </BaseModal>
  );
}

// Preset Modal Footer Buttons
interface ModalFooterProps {
  onClose: () => void;
  onConfirm?: () => void;
  closeLabel?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  confirmVariant?: "default" | "error" | "success" | "warning";
  closeVariant?: "outline" | "ghost";
  fullWidth?: boolean;
}

export function ModalFooter({
  onClose,
  onConfirm,
  closeLabel = "Cancel",
  confirmLabel = "Confirm",
  isSubmitting = false,
  confirmVariant = "default",
  closeVariant = "outline",
  fullWidth = false,
}: ModalFooterProps) {
  const getConfirmStyles = () => {
    switch (confirmVariant) {
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  return (
    <div className={cn("flex gap-3", fullWidth ? "w-full" : "justify-end")}>
      <Button
        type="button"
        variant={closeVariant}
        onClick={onClose}
        className={cn(
          "h-10 px-4",
          closeVariant === "outline"
            ? "border-gray-300 text-gray-700 hover:bg-gray-50"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        {closeLabel}
      </Button>
      {onConfirm && (
        <Button
          type="submit"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={cn(
            "h-10 px-4",
            getConfirmStyles(),
            isSubmitting && "opacity-70"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            confirmLabel
          )}
        </Button>
      )}
    </div>
  );
}
