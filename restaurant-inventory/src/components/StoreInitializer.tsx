"use client";

import { useEffect } from "react";

/**
 * StoreInitializer component
 *
 * This component initializes all Zustand stores when the app loads.
 * It ensures stores are initialized on the client side only.
 * Note: Auth is now handled by AuthProvider context instead of the Zustand store.
 */
export function StoreInitializer() {
  // Initialize stores
  useEffect(() => {
    // Add initialization for other stores here when needed
  }, []);

  // This component doesn't render anything
  return null;
}
