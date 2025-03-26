"use client";

import React, { useState, ReactNode, createContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { announcer } from "../components/accessibility/helpers";

// Define toast types
export type ToastType = "success" | "error" | "info" | "warning";

// Define the shape of a toast
export interface Toast {
  id: string;
  message: string | ReactNode;
  type: ToastType;
  duration: number;
  screenReaderMessage?: string;
  onDismiss?: () => void;
}

// Define the toast context shape
interface ToastContextType {
  toasts: Toast[];
  addToast: (
    message: string | ReactNode,
    type: ToastType,
    options?: {
      duration?: number;
      screenReaderMessage?: string;
      onDismiss?: () => void;
    }
  ) => void;
  removeToast: (id: string) => void;
}

// Toast context to manage toast state
export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

// Toast Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true once the component mounts on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to add a new toast
  const addToast = (
    message: string | ReactNode,
    type: ToastType,
    options: {
      duration?: number;
      screenReaderMessage?: string;
      onDismiss?: () => void;
    } = {}
  ) => {
    const id = Date.now().toString();
    const duration = options.duration || 3000;

    setToasts((prev) => [...prev, { id, message, type, duration, ...options }]);

    // Announce to screen readers
    if (options.screenReaderMessage) {
      announcer.announce(options.screenReaderMessage, "polite");
    } else if (typeof message === "string") {
      announcer.announce(message, "polite");
    }

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
      if (options.onDismiss) {
        options.onDismiss();
      }
    }, duration);
  };

  // Remove a toast by id
  const removeToast = (id: string) => {
    const toast = toasts.find((t) => t.id === id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (toast?.onDismiss) {
      toast.onDismiss();
    }
  };

  // Context value
  const contextValue = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {isMounted &&
        toasts.length > 0 &&
        createPortal(
          <div className="toast toast-end z-50">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`alert ${
                  toast.type === "success"
                    ? "alert-success"
                    : toast.type === "error"
                    ? "alert-error"
                    : toast.type === "warning"
                    ? "alert-warning"
                    : "alert-info"
                } flex justify-between items-center shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl`}
              >
                <div className="flex-1">
                  {typeof toast.message === "string" ? (
                    <span>{toast.message}</span>
                  ) : (
                    toast.message
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-circle btn-sm"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

// Helper functions to show different types of toasts
const showToast = (
  message: string | ReactNode,
  type: ToastType,
  options?: {
    duration?: number;
    screenReaderMessage?: string;
    onDismiss?: () => void;
  }
) => {
  // Get the toast context from the global object
  // This allows us to call toast outside of React components
  if (typeof window !== "undefined") {
    const event = new CustomEvent("show-toast", {
      detail: { message, type, options },
    });
    window.dispatchEvent(event);
  }
};

// Listen for toast events
if (typeof window !== "undefined") {
  window.addEventListener("show-toast", ((event: CustomEvent) => {
    const { message, type, options } = event.detail;

    // Find the toast container
    const toastContainer = document.querySelector(".toast");
    if (!toastContainer) return;

    // Create a new toast element
    const toast = document.createElement("div");
    toast.className = `alert ${
      type === "success"
        ? "alert-success"
        : type === "error"
        ? "alert-error"
        : type === "warning"
        ? "alert-warning"
        : "alert-info"
    } shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl`;

    // Set the toast content
    if (typeof message === "string") {
      toast.textContent = message;
      // Announce to screen readers
      if (options?.screenReaderMessage) {
        announcer.announce(options.screenReaderMessage, "polite");
      } else {
        announcer.announce(message, "polite");
      }
    } else {
      // For ReactNode messages, we need to use React rendering
      // This is handled by the ToastProvider component
      // This is a fallback for direct API calls outside React
      toast.textContent = "Notification";
      if (options?.screenReaderMessage) {
        announcer.announce(options.screenReaderMessage, "polite");
      }
    }

    // Add the toast to the container
    toastContainer.appendChild(toast);

    // Remove the toast after the duration
    setTimeout(() => {
      toast.remove();
      if (options?.onDismiss) {
        options.onDismiss();
      }
    }, options?.duration || 3000);
  }) as EventListener);
}

// Export the toast API
export const toast = {
  success: (
    message: string | ReactNode,
    options?: {
      duration?: number;
      screenReaderMessage?: string;
      onDismiss?: () => void;
    }
  ) => showToast(message, "success", options),

  error: (
    message: string | ReactNode,
    options?: {
      duration?: number;
      screenReaderMessage?: string;
      onDismiss?: () => void;
    }
  ) => showToast(message, "error", options),

  info: (
    message: string | ReactNode,
    options?: {
      duration?: number;
      screenReaderMessage?: string;
      onDismiss?: () => void;
    }
  ) => showToast(message, "info", options),

  warning: (
    message: string | ReactNode,
    options?: {
      duration?: number;
      screenReaderMessage?: string;
      onDismiss?: () => void;
    }
  ) => showToast(message, "warning", options),
};
