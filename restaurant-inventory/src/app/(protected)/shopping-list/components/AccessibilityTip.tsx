"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { announcer } from "./ScreenReaderAnnouncer";

interface AccessibilityTipProps {
  message: string;
  screenReaderMessage?: string;
  importance?: "info" | "warning" | "error" | "success";
  autoDisappear?: boolean;
  duration?: number;
  onDismiss?: () => void;
}

const AccessibilityTip: React.FC<AccessibilityTipProps> = ({
  message,
  screenReaderMessage,
  importance = "info",
  autoDisappear = false,
  duration = 10000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Get the color class based on importance
  const getColorClass = () => {
    switch (importance) {
      case "warning":
        return "bg-warning text-warning-content";
      case "error":
        return "bg-error text-error-content";
      case "success":
        return "bg-success text-success-content";
      default:
        return "bg-info text-info-content";
    }
  };

  // Announce the tip to screen readers when it appears
  useEffect(() => {
    if (isVisible && (screenReaderMessage || message)) {
      announcer.announce(
        screenReaderMessage || message,
        importance === "error" ? "assertive" : "polite"
      );
    }
  }, [isVisible, message, screenReaderMessage, importance]);

  // Auto-disappear functionality
  useEffect(() => {
    if (autoDisappear && isVisible) {
      const timeoutId = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, duration);

      return () => clearTimeout(timeoutId);
    }
  }, [autoDisappear, duration, isVisible, onDismiss]);

  if (!isVisible) return null;

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      className={`rounded-lg shadow-lg p-4 mb-4 ${getColorClass()}`}
      role="alert"
    >
      <div className="flex items-start">
        <Lightbulb className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">{message}</div>
        </div>
        <button
          onClick={handleDismiss}
          className="btn btn-sm btn-circle ml-2"
          aria-label="Dismiss accessibility tip"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Utility function to show tips based on user behavior or device
export const showContextualTip = (
  tipType: "keyboard" | "mobile" | "screenReader" | "firstTime" | "custom",
  customMessage?: string,
  customScreenReaderMessage?: string
) => {
  let message = "";
  let screenReaderMessage = "";

  switch (tipType) {
    case "keyboard":
      message =
        "Press Shift+? to view keyboard shortcuts for faster navigation.";
      screenReaderMessage =
        "Keyboard shortcuts are available. Press Shift plus question mark to view them.";
      break;
    case "mobile":
      message = "Swipe left or right on items to reveal quick actions.";
      screenReaderMessage =
        "On mobile devices, swipe left or right on list items to access quick actions.";
      break;
    case "screenReader":
      message =
        "This page is optimized for screen readers with ARIA landmarks and keyboard navigation.";
      screenReaderMessage =
        "Screen reader optimizations are active. Use heading navigation to quickly move between sections.";
      break;
    case "firstTime":
      message =
        "Welcome! Use the tabs above to navigate between different sections of the shopping list.";
      screenReaderMessage =
        "Welcome to the shopping list. Use the tab list at the top to switch between sections.";
      break;
    case "custom":
      message = customMessage || "Accessibility tip";
      screenReaderMessage =
        customScreenReaderMessage || customMessage || "Accessibility tip";
      break;
  }

  return (
    <AccessibilityTip
      message={message}
      screenReaderMessage={screenReaderMessage}
      autoDisappear={true}
    />
  );
};

export default AccessibilityTip;
