"use client";

import React, { useEffect } from "react";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import {
  AccessibilityPanel,
  KeyboardShortcuts,
} from "./components/accessibility";
import { mountAnnouncer } from "./components/accessibility/helpers";
import { ToastProvider } from "./utils/toast";
import {
  GlobalAnnouncer,
  useReducedMotion,
} from "@/components/ui/accessibility-helpers";

// Import our CSS
import "./styles/accessibility.css";
import "./styles/variables.css"; // Import CSS variables first
import "./styles/shopping-list.css"; // Import our custom shopping list styles

export default function ShoppingListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  // Mount the screen reader announcer on the client side
  useEffect(() => {
    // Keep the legacy announcer for backward compatibility
    mountAnnouncer();

    // Add reduced motion class if needed
    if (prefersReducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }

    return () => {
      document.documentElement.classList.remove("reduced-motion");
    };
  }, [prefersReducedMotion]);

  return (
    <AccessibilityProvider>
      <ToastProvider>
        <div className="min-h-screen bg-base-100">
          {children}

          {/* Accessibility Tools */}
          <div className="fixed bottom-4 left-4 z-50">
            <KeyboardShortcuts />
          </div>
          <AccessibilityPanel />

          {/* Global Announcer for Screen Readers */}
          <GlobalAnnouncer />
        </div>
      </ToastProvider>
    </AccessibilityProvider>
  );
}
