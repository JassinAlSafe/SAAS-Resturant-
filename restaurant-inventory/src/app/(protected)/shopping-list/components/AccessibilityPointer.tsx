"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Info, X } from "lucide-react";
import { announcer } from "./ScreenReaderAnnouncer";
import { useAccessibility } from "../context/AccessibilityContext";

interface AccessibilityPointerProps {
  targetId?: string;
  targetSelector?: string;
  message: string;
  position?: "top" | "right" | "bottom" | "left";
  onDismiss?: () => void;
  delay?: number;
  autoDismiss?: boolean;
  dismissDelay?: number;
  screenReaderMessage?: string;
  importance?: "info" | "warning" | "error" | "success";
}

const AccessibilityPointer: React.FC<AccessibilityPointerProps> = ({
  targetId,
  targetSelector,
  message,
  position = "bottom",
  onDismiss,
  delay = 500,
  autoDismiss = false,
  dismissDelay = 10000,
  screenReaderMessage,
  importance = "info",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const pointerRef = useRef<HTMLDivElement>(null);
  const { settings } = useAccessibility();

  // Get the color based on importance
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

  // Calculate position of the pointer based on target element
  const calculatePosition = () => {
    const target = targetId
      ? document.getElementById(targetId)
      : targetSelector
      ? document.querySelector(targetSelector)
      : null;

    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let x = 0;
    let y = 0;

    switch (position) {
      case "top":
        x = targetRect.left + targetRect.width / 2 + scrollX;
        y = targetRect.top + scrollY;
        break;
      case "right":
        x = targetRect.right + scrollX;
        y = targetRect.top + targetRect.height / 2 + scrollY;
        break;
      case "bottom":
        x = targetRect.left + targetRect.width / 2 + scrollX;
        y = targetRect.bottom + scrollY;
        break;
      case "left":
        x = targetRect.left + scrollX;
        y = targetRect.top + targetRect.height / 2 + scrollY;
        break;
    }

    setCoordinates({ x, y });
  };

  // Handle positioning and visibility
  useEffect(() => {
    const showPointer = () => {
      calculatePosition();
      setIsVisible(true);

      // Announce the pointer for screen readers
      if (screenReaderMessage || message) {
        announcer.announce(screenReaderMessage || message, "polite");
      }
    };

    // Show the pointer after the specified delay
    const timeoutId = setTimeout(showPointer, delay);

    // Auto-dismiss after dismissDelay if enabled
    let dismissTimeoutId: NodeJS.Timeout;
    if (autoDismiss) {
      dismissTimeoutId = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, delay + dismissDelay);
    }

    return () => {
      clearTimeout(timeoutId);
      if (autoDismiss) {
        clearTimeout(dismissTimeoutId);
      }
    };
  }, [
    targetId,
    targetSelector,
    delay,
    autoDismiss,
    dismissDelay,
    message,
    screenReaderMessage,
    onDismiss,
  ]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isVisible]);

  // Focus trap for keyboard navigation within the pointer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || !pointerRef.current) return;

      // Close on escape key
      if (e.key === "Escape") {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  // Adjust the position based on the pointer's size
  const getPointerStyle = () => {
    if (!pointerRef.current) return {};

    const pointerRect = pointerRef.current.getBoundingClientRect();
    const offset = 10; // Offset from the target element

    let style: React.CSSProperties = {
      position: "absolute",
      zIndex: 1000,
    };

    switch (position) {
      case "top":
        style.left = `${coordinates.x - pointerRect.width / 2}px`;
        style.top = `${coordinates.y - pointerRect.height - offset}px`;
        break;
      case "right":
        style.left = `${coordinates.x + offset}px`;
        style.top = `${coordinates.y - pointerRect.height / 2}px`;
        break;
      case "bottom":
        style.left = `${coordinates.x - pointerRect.width / 2}px`;
        style.top = `${coordinates.y + offset}px`;
        break;
      case "left":
        style.left = `${coordinates.x - pointerRect.width - offset}px`;
        style.top = `${coordinates.y - pointerRect.height / 2}px`;
        break;
    }

    // Apply high-contrast adjustments if needed
    if (settings.highContrast) {
      style.boxShadow = "0 0 0 3px #ffffff";
    }

    return style;
  };

  // Get the pointer arrow position class
  const getArrowClass = () => {
    switch (position) {
      case "top":
        return "pointer-arrow-top";
      case "right":
        return "pointer-arrow-right";
      case "bottom":
        return "pointer-arrow-bottom";
      case "left":
        return "pointer-arrow-left";
      default:
        return "pointer-arrow-bottom";
    }
  };

  return (
    <div
      ref={pointerRef}
      style={getPointerStyle()}
      className={`p-3 rounded-lg shadow-lg max-w-xs ${getColorClass()} ${getArrowClass()}`}
      role="tooltip"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">{message}</div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onDismiss) onDismiss();
          }}
          className="btn btn-xs btn-circle"
          aria-label="Dismiss accessibility tip"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default AccessibilityPointer;
