"use client";

import React, { useEffect } from "react";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import AccessibilityPanel from "./components/AccessibilityPanel";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import { mountAnnouncer } from "./components/ScreenReaderAnnouncer";
import { ToastProvider } from "./utils/toast";

// Import our CSS
import "./styles/accessibility.css";
import "./styles/variables.css"; // Import CSS variables first
import "./styles/shopping-list.css"; // Import our custom shopping list styles

export default function ShoppingListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mount the screen reader announcer on the client side
  useEffect(() => {
    mountAnnouncer();
  }, []);

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
        </div>
      </ToastProvider>
    </AccessibilityProvider>
  );
}
