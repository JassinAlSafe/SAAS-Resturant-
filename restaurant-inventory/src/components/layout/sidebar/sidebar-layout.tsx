"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChevronLeftIcon, ChevronRightIcon, MenuIcon } from "lucide-react";
// Remove unused import
// import { useAuth } from "@/lib/auth-context";
import { Navigation } from "./navigation";
import { UserProfile } from "./user-profile";
import { SidebarChildrenContext, SidebarContextType } from "./types";

export function SidebarLayout() {
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [state, setState] = React.useState<"expanded" | "collapsed">(
    "expanded"
  );
  const children = React.useContext(SidebarChildrenContext);

  // Check if we're on mobile on component mount and window resize
  React.useEffect(() => {
    const handleResize = () => {
      // Use 768px (md) as mobile breakpoint and 1024px (lg) as tablet breakpoint
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse sidebar on tablet-sized screens (768px-1023px)
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setOpen(false);
      } else if (window.innerWidth >= 1024) {
        // Expand on larger screens, but respect user preference if available
        const savedState = localStorage.getItem("sidebar_state");
        if (savedState) {
          setOpen(savedState === "true");
        } else {
          setOpen(true);
        }
      }

      // When switching to mobile, ensure the sidebar is closed
      if (mobile) {
        setOpen(false);
        setOpenMobile(false);
      }
    };

    // Run once on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get the saved sidebar state from localStorage when component mounts
  React.useEffect(() => {
    // Only read local storage on desktop
    if (!isMobile && typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar_state");
      if (savedState) {
        setOpen(savedState === "true");
      }
    }
  }, [isMobile]);

  // Update state when open changes
  React.useEffect(() => {
    setState(open ? "expanded" : "collapsed");
  }, [open]);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      const newState = !open;
      setOpen(newState);
      // Save sidebar state to localStorage for desktop
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_state", String(newState));
      }
    }
  };

  // Create sidebar context with our state
  const sidebarContext: SidebarContextType = {
    open,
    setOpen,
    state,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* For desktop: normal sidebar */}
        {!isMobile && (
          <div
            className={`fixed top-0 left-0 h-full z-30 transition-all duration-200 ease-in-out ${
              open ? "w-64" : "w-16"
            } bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800`}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center justify-between">
                {open && (
                  <div className="text-lg font-semibold truncate">
                    Restaurant Inventory
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                  className={open ? "ml-auto" : "mx-auto"}
                >
                  {open ? (
                    <ChevronLeftIcon size={18} />
                  ) : (
                    <ChevronRightIcon size={18} />
                  )}
                </Button>
              </div>
              <Navigation sidebarContext={sidebarContext} />
              <UserProfile sidebarContext={sidebarContext} />
            </div>
          </div>
        )}

        {/* For mobile: sheet/dialog style sidebar with overlay */}
        {isMobile && openMobile && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setOpenMobile(false)}
            />
            <div
              className="fixed inset-y-0 left-0 max-w-[85%] sm:max-w-[320px] w-full bg-white dark:bg-gray-950 shadow-xl flex flex-col h-full z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent clicks within sidebar from closing it
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                <div className="text-lg font-semibold truncate">
                  Restaurant Inventory
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenMobile(false)}
                  aria-label="Close sidebar"
                >
                  <ChevronLeftIcon size={18} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Navigation
                  sidebarContext={{ ...sidebarContext, open: true }}
                />
              </div>
              <UserProfile sidebarContext={{ ...sidebarContext, open: true }} />
            </div>
          </div>
        )}

        {/* Mobile toggle button - only visible on mobile */}
        {isMobile && !openMobile && (
          <Button
            className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-primary text-white shadow-xl border border-primary/10"
            onClick={() => setOpenMobile(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={24} />
          </Button>
        )}

        {/* Main content */}
        <div
          className={`flex-1 h-screen overflow-auto bg-gray-50 dark:bg-gray-900 ${
            !isMobile ? (open ? "ml-64" : "ml-16") : ""
          } transition-all duration-200 ease-in-out`}
        >
          {isMobile && (
            <div className="sticky top-0 z-10 p-4 flex items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="text-lg font-semibold truncate">
                Restaurant Inventory
              </div>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          )}
          {!isMobile && (
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          )}
          <main className="p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
