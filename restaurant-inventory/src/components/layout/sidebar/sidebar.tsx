"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./components/SidebarHeader";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { SidebarUserProfile } from "./components/SidebarUserProfile";
import { SidebarCollapseButton } from "./components/SidebarCollapseButton";
import { MobileSidebar } from "./components/MobileSidebar";
import { AppHeader } from "./components/AppHeader";
import { MenuIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessProfile } from "@/lib/business-profile-context";
import { useMediaQueries } from "@/hooks/use-media-query";
import { navItems } from "./nav-items"; // Import navItems directly
import { useUser } from "@/hooks/use-user";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";

// Custom hook for sidebar state management
const useSidebarState = () => {
  // Initialize with a default state (closed) to avoid hydration mismatch
  const [open, setOpen] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  // Use useEffect to update state from localStorage after initial render
  React.useEffect(() => {
    if (!initialized) {
      const savedState = localStorage.getItem("sidebar_state");
      setOpen(savedState !== null ? savedState === "true" : true);
      setInitialized(true);
    }
  }, [initialized]);

  // Toggle sidebar open/closed
  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar_state", String(newState));
      return newState;
    });
  }, []);

  return {
    open,
    setOpen,
    toggleSidebar,
  };
};

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { open, toggleSidebar } = useSidebarState();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});
  const { isMobile } = useMediaQueries();
  const { profile } = useBusinessProfile();
  const { user, handleLogout } = useUser();

  const businessName = profile?.name || "Enelys";
  const logoUrl = profile?.logo || "";

  // Toggle a section expanded/collapsed
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out",
            "bg-white border-r border-gray-200 shadow-sm",
            open ? "w-64" : "w-16"
          )}
          style={{ pointerEvents: "auto" }}
        >
          <div className="relative flex h-full flex-col">
            {/* Header */}
            <SidebarHeader
              open={open}
              businessName={businessName}
              logoUrl={logoUrl}
            />

            {/* Collapse Button */}
            <div className="relative h-0 w-full">
              <SidebarCollapseButton
                open={open}
                toggleSidebar={toggleSidebar}
              />
            </div>

            {/* Navigation - Main Menu */}
            <div className="flex-1 overflow-y-auto py-3">
              <div className={cn(open ? "px-5 mb-2" : "px-0 mb-2")}>
                <p
                  className={cn(
                    "text-xs font-medium text-gray-500 uppercase tracking-wider",
                    !open && "text-center"
                  )}
                >
                  {open ? "MAIN MENU" : ""}
                </p>
              </div>
              <SidebarNavigation
                open={open}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                navItems={navItems}
              />
            </div>

            {/* Settings Icon */}
            {!open && (
              <div className="flex justify-center mb-2">
                <Tooltip content="Settings" position="right">
                  <Link href="/settings">
                    <SettingsIcon className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                  </Link>
                </Tooltip>
              </div>
            )}

            {/* User Profile */}
            <SidebarUserProfile
              open={open}
              user={user}
              handleLogout={handleLogout}
            />
          </div>
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          {/* Mobile Menu Button */}
          <Tooltip content="Open Menu" position="right">
            <div className="fixed top-4 left-4 z-40">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setOpenMobile(!openMobile)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </div>
          </Tooltip>

          {/* Mobile Sidebar Component */}
          <MobileSidebar
            openMobile={openMobile}
            setOpenMobile={setOpenMobile}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            navItems={navItems}
            businessName={businessName}
            logoUrl={logoUrl}
            handleLogout={handleLogout}
            user={user}
          />
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-200 ease-in-out",
          !isMobile && (open ? "ml-64" : "ml-16")
        )}
      >
        {/* App Header - Now using the extracted component */}
        <AppHeader
          isMobile={isMobile}
          openMobile={openMobile}
          setOpenMobile={setOpenMobile}
          user={user}
        />

        {/* Page Content - Make it scrollable */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
