"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * StoreInitializer component
 *
 * This component initializes all Zustand stores when the app loads.
 * It ensures stores are initialized on the client side only.
 */
export function StoreInitializer() {
  // Initialize auth store
  useEffect(() => {
    // Initialize auth store if not already initialized
    if (!useAuthStore.getState().isInitialized) {
      useAuthStore.getState().initialize();
    }

    // Add initialization for other stores here when needed
  }, []);

  // This component doesn't render anything
  return null;
}
