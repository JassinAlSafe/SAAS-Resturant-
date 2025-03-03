"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import useSafeMediaQueries from "@/hooks/use-media-query";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";

import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { DesktopContent } from "./desktop-content";
import { MobileContent } from "./mobile-content";
import { SidebarLayout } from "./sidebar-layout";
import { Navigation } from "./navigation";
import { UserProfile } from "./user-profile";
import { SidebarChildrenContext } from "./types";

// Main sidebar layout component
function MainSidebarLayout() {
  const children = React.useContext(SidebarChildrenContext);
  const { isMobile, isTablet } = useSafeMediaQueries();
  const { updateLastInteraction } = useSidebarStore();

  // Use a ref to track last update time for throttling
  const lastUpdateRef = React.useRef<number>(Date.now());
  const throttleTimeMs = 5000; // Only update at most once every 5 seconds

  // Update last interaction time on user activity, but throttled
  React.useEffect(() => {
    const handleActivity = () => {
      const now = Date.now();
      // Only update if enough time has passed since last update
      if (now - lastUpdateRef.current > throttleTimeMs) {
        updateLastInteraction();
        lastUpdateRef.current = now;
      }
    };

    // Add event listeners for user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [updateLastInteraction, throttleTimeMs]);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex min-h-screen w-full",
          "transition-all duration-300 ease-in-out",
          "relative overflow-x-hidden" // Added overflow-x-hidden to prevent horizontal scrolling
        )}
      >
        {/* Conditionally render mobile or desktop components */}
        {isMobile || isTablet ? (
          <>
            <MobileSidebar />
            <MobileContent>{children}</MobileContent>
          </>
        ) : (
          <>
            <DesktopSidebar />
            <DesktopContent>{children}</DesktopContent>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

interface SidebarNavigationProps {
  children: React.ReactNode;
}

export function SidebarNavigation({ children }: SidebarNavigationProps) {
  return (
    <SidebarChildrenContext.Provider value={children}>
      <MainSidebarLayout />
    </SidebarChildrenContext.Provider>
  );
}

// Export all components for direct access if needed
export { SidebarLayout, Navigation, UserProfile };

// Export all sidebar components for easy imports
export * from "./types";
export * from "./navigation";
export * from "./sidebar-header";
export * from "./header-search";
export * from "./user-profile";
export * from "./desktop-sidebar";
export * from "./mobile-sidebar";
export * from "./desktop-content";
export * from "./mobile-content";
