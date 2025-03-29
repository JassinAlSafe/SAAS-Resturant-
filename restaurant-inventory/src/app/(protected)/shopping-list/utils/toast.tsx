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
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="flex items-center bg-white shadow-sm rounded-md px-4 py-3 relative"
              >
                {/* Icon based on toast type */}
                <div className="mr-3">
                  {toast.type === "success" && (
                    <div className="bg-black rounded-full p-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  {toast.type === "error" && (
                    <div className="bg-red-500 rounded-full p-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                  {toast.type === "warning" && (
                    <div className="bg-amber-500 rounded-full p-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 9V13M12 17H12.01M12 3L4 21H20L12 3Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  {toast.type === "info" && (
                    <div className="bg-blue-500 rounded-full p-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 16V12M12 8H12.01M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="flex-1 text-base font-medium text-gray-900">
                  {typeof toast.message === "string" ? (
                    <span>{toast.message}</span>
                  ) : (
                    toast.message
                  )}
                </div>

                {/* Close button */}
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
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

    // Create a toast container if it doesn't exist
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className =
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md toast-container";
      document.body.appendChild(toastContainer);
    }

    // Create a new toast element
    const toast = document.createElement("div");
    toast.className =
      "flex items-center bg-white shadow-sm rounded-md px-4 py-3 relative";

    // Create icon container
    const iconContainer = document.createElement("div");
    iconContainer.className = "mr-3";

    // Add appropriate icon based on type
    const iconWrapper = document.createElement("div");

    if (type === "success") {
      iconWrapper.className = "bg-black rounded-full p-1.5";
      iconWrapper.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    } else if (type === "error") {
      iconWrapper.className = "bg-red-500 rounded-full p-1.5";
      iconWrapper.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    } else if (type === "warning") {
      iconWrapper.className = "bg-amber-500 rounded-full p-1.5";
      iconWrapper.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9V13M12 17H12.01M12 3L4 21H20L12 3Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    } else {
      iconWrapper.className = "bg-blue-500 rounded-full p-1.5";
      iconWrapper.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16V12M12 8H12.01M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }

    iconContainer.appendChild(iconWrapper);
    toast.appendChild(iconContainer);

    // Create content container
    const contentDiv = document.createElement("div");
    contentDiv.className = "flex-1 text-base font-medium text-gray-900";

    // Set the toast content
    if (typeof message === "string") {
      contentDiv.textContent = message;
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
      contentDiv.textContent = "Notification";
      if (options?.screenReaderMessage) {
        announcer.announce(options.screenReaderMessage, "polite");
      }
    }
    toast.appendChild(contentDiv);

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.className =
      "absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors";
    closeButton.setAttribute("aria-label", "Dismiss notification");

    // Create X icon
    const xIcon = document.createElement("span");
    xIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    closeButton.appendChild(xIcon);

    // Add event listener to close button
    closeButton.addEventListener("click", () => {
      toast.remove();
      if (options?.onDismiss) {
        options.onDismiss();
      }
    });
    toast.appendChild(closeButton);

    // Add animation class
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";

    // Add the toast to the container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
      toast.style.transition = "opacity 300ms, transform 300ms";
    }, 10);

    // Remove the toast after the duration
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";

      // Remove from DOM after transition completes
      setTimeout(() => {
        toast.remove();

        // Clean up container if empty
        if (toastContainer && toastContainer.children.length === 0) {
          toastContainer.remove();
        }

        if (options?.onDismiss) {
          options.onDismiss();
        }
      }, 300);
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
