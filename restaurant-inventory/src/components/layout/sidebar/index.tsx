"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import useSafeMediaQueries from "@/hooks/use-media-query";

import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { DesktopContent } from "./desktop-content";
import { MobileContent } from "./mobile-content";

// Create a context to pass children down to the SidebarLayout
const SidebarChildrenContext = React.createContext<React.ReactNode>(null);

// Main sidebar layout component
function SidebarLayout() {
  const children = React.useContext(SidebarChildrenContext);
  const { isMobile, isTablet } = useSafeMediaQueries();

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full">
        {isMobile || isTablet ? <MobileSidebar /> : <DesktopSidebar />}
        {isMobile || isTablet ? (
          <div className="flex-1">
            <MobileContent>{children}</MobileContent>
          </div>
        ) : (
          <div className="flex-1">
            <DesktopContent>{children}</DesktopContent>
          </div>
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
      <SidebarLayout />
    </SidebarChildrenContext.Provider>
  );
}

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
