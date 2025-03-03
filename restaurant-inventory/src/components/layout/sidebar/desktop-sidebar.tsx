"use client";

import * as React from "react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

// Keyboard navigation constants
const KEY = {
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
};

export function DesktopSidebar() {
  const { isOpen, expandedSections, toggleSection, setOpen } =
    useSidebarStore();
  const { signOut } = useAuth();
  const [hasMounted, setHasMounted] = React.useState(false);
  const inventoryExpanded = expandedSections["inventory"] !== false;
  const menuSalesExpanded = expandedSections["menuSales"] !== false;
  const analyticsExpanded = expandedSections["analytics"] !== false;
  const adminExpanded = expandedSections["admin"] !== false;
  const pathname = usePathname();

  // Refs for keyboard navigation
  const navRefs = React.useRef<(HTMLElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = React.useState<number>(-1);

  // Set mounted state after hydration
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Clear references when expanded sections change
  React.useEffect(() => {
    navRefs.current = [];
  }, [expandedSections]);

  // Add keyboard event listeners only after hydration
  React.useEffect(() => {
    if (!hasMounted) return;

    // Keyboard navigation implementation
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Cmd/Ctrl + B
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault();
        setOpen(!isOpen);
      }

      // Focus the sidebar with Cmd/Ctrl + J
      if ((event.metaKey || event.ctrlKey) && event.key === "j") {
        event.preventDefault();
        if (navRefs.current.length > 0) {
          setFocusIndex(0);
          navRefs.current[0]?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusIndex, hasMounted]);

  // Handle keyboard navigation within the sidebar
  const handleNavKeyDown = (e: React.KeyboardEvent, index: number) => {
    const refs = navRefs.current.filter(Boolean);

    switch (e.key) {
      case KEY.DOWN:
        e.preventDefault();
        if (index < refs.length - 1) {
          const nextIndex = index + 1;
          setFocusIndex(nextIndex);
          refs[nextIndex]?.focus();
        }
        break;

      case KEY.UP:
        e.preventDefault();
        if (index > 0) {
          const prevIndex = index - 1;
          setFocusIndex(prevIndex);
          refs[prevIndex]?.focus();
        }
        break;

      case KEY.HOME:
        e.preventDefault();
        setFocusIndex(0);
        refs[0]?.focus();
        break;

      case KEY.END:
        e.preventDefault();
        const lastIndex = refs.length - 1;
        setFocusIndex(lastIndex);
        refs[lastIndex]?.focus();
        break;

      case KEY.RIGHT:
        // If the current focused element is a section header, expand it
        if ((e.target as HTMLElement).getAttribute("data-section")) {
          e.preventDefault();
          const section = (e.target as HTMLElement).getAttribute(
            "data-section"
          );
          if (section && !expandedSections[section]) {
            toggleSection(section);
          }
        }
        break;

      case KEY.LEFT:
        // If the current focused element is a section header, collapse it
        if ((e.target as HTMLElement).getAttribute("data-section")) {
          e.preventDefault();
          const section = (e.target as HTMLElement).getAttribute(
            "data-section"
          );
          if (section && expandedSections[section]) {
            toggleSection(section);
          }
        }
        // If it's an item within an expanded section, focus the section header
        else if (
          (e.target as HTMLElement).getAttribute("data-parent-section")
        ) {
          e.preventDefault();
          const parentIndex = refs.findIndex(
            (ref) =>
              ref?.getAttribute("data-section") ===
              (e.target as HTMLElement).getAttribute("data-parent-section")
          );
          if (parentIndex !== -1) {
            setFocusIndex(parentIndex);
            refs[parentIndex]?.focus();
          }
        }
        break;

      case KEY.ESCAPE:
        if (isOpen) {
          e.preventDefault();
          setOpen(false);
        }
        break;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Only render client-specific UI features after component has mounted
  if (!hasMounted) {
    return (
      <aside
        aria-label="Main Navigation"
        className={cn(
          "fixed h-screen bg-sidebar flex-col hidden md:flex z-30 transition-all duration-300 ease-in-out",
          isOpen ? "sidebar-expanded" : "sidebar-collapsed"
        )}
        style={{ width: isOpen ? "16rem" : "4.5rem", left: "0px" }}
      >
        {/* Simple placeholder content that matches the structure but with minimal interactivity */}
        <div className="p-4 flex items-center justify-between">
          <span
            className={cn(
              "font-semibold transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0"
            )}
          >
            Dashboard
          </span>
        </div>
        <div className="flex-1">{/* Static navigation placeholder */}</div>
      </aside>
    );
  }

  // Regular render with full functionality
  return (
    <aside
      aria-label="Main Navigation"
      className={cn(
        "fixed h-screen bg-sidebar flex-col hidden md:flex z-30",
        isOpen ? "sidebar-expanded" : "sidebar-collapsed",
        "transition-all duration-500 ease-in-out overflow-hidden",
        "shadow-sm border-r border-gray-200 dark:border-gray-800",
        isOpen ? "w-64" : "w-16" // Increased from w-14 to w-16 for better visibility
      )}
      style={{
        width: isOpen ? "16rem" : "4rem",
        left: 0,
      }} // Exact pixel matching with left:0 to ensure no gap
    >
      {/* Toggle Button - positioned at center of right edge */}
      <button
        className={cn(
          "h-8 w-8 rounded-full shadow-md bg-sidebar-accent flex items-center justify-center absolute -right-4 top-16 z-10",
          "hover:bg-sidebar-hover"
        )}
        onClick={() => setOpen(!isOpen)}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        ref={(el) => {
          if (el) navRefs.current[-1] = el;
        }}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      <div className={cn("flex flex-col h-full", !isOpen && "items-center")}>
        {/* Main content area with scrolling */}
        <div
          className={cn(
            "p-3 flex-1 flex flex-col space-y-4 overflow-y-auto",
            !isOpen && "items-center"
          )}
        >
          {/* User Profile at Top */}
          {isOpen ? (
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-all duration-300 ease-in-out"
              tabIndex={0}
              role="button"
              aria-label="User Profile Menu"
              ref={(el) => {
                if (el) navRefs.current[0] = el;
              }}
              onKeyDown={(e) => handleNavKeyDown(e, 0)}
            >
              <Image
                src="https://github.com/shadcn.png"
                alt="User"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm font-medium flex-1">
                Restaurant Manager
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div
                    className="p-1 flex justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 ease-in-out"
                    tabIndex={0}
                    role="button"
                    aria-label="User Profile Menu"
                    ref={(el) => {
                      if (el) navRefs.current[0] = el;
                    }}
                    onKeyDown={(e) => handleNavKeyDown(e, 0)}
                  >
                    <Image
                      src="https://github.com/shadcn.png"
                      alt="User"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Restaurant Manager</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Search Bar - only when expanded */}
          {isOpen && (
            <div className="relative mb-2 transition-all duration-300 ease-in-out">
              <div className="relative rounded-lg border border-border dark:border-border/30 bg-card dark:bg-card overflow-hidden">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <Input
                  placeholder="Search..."
                  className="pl-9 py-2 h-9 border-0 bg-transparent focus-visible:ring-0 text-sm"
                  aria-label="Search"
                  ref={(el) => {
                    if (el) navRefs.current[1] = el;
                  }}
                  onKeyDown={(e) => handleNavKeyDown(e, 1)}
                />
              </div>
            </div>
          )}

          {/* Search Icon - only when collapsed */}
          {!isOpen && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out"
                    tabIndex={0}
                    role="button"
                    aria-label="Search"
                    ref={(el) => {
                      if (el) navRefs.current[1] = el;
                    }}
                    onKeyDown={(e) => handleNavKeyDown(e, 1)}
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    Search <span className="text-xs opacity-70">(⌘ + K)</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Main Navigation */}
          <div className="space-y-1 w-full">
            {isOpen ? (
              <NavigationItem
                icon="🏠"
                label="Dashboard"
                href="/dashboard"
                active={pathname === "/dashboard"}
                refCallback={(el) => {
                  if (el) navRefs.current[2] = el;
                }}
                onKeyDown={(e) => handleNavKeyDown(e, 2)}
                navIndex={2}
                focusIndex={focusIndex}
              />
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="w-full flex justify-center">
                      <NavigationItem
                        icon="🏠"
                        href="/dashboard"
                        active={pathname === "/dashboard"}
                        collapsedMode
                        refCallback={(el) => {
                          if (el) navRefs.current[2] = el;
                        }}
                        onKeyDown={(e) => handleNavKeyDown(e, 2)}
                        navIndex={2}
                        focusIndex={focusIndex}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Dashboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Inventory Management Section */}
          <div className={!isOpen ? "w-full flex justify-center" : ""}>
            {isOpen ? (
              <>
                <div
                  className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                  onClick={() => toggleSection("inventory")}
                  tabIndex={0}
                  role="button"
                  aria-expanded={inventoryExpanded}
                  aria-controls="inventory-items"
                  data-section="inventory"
                  ref={(el) => {
                    if (el) navRefs.current[3] = el;
                  }}
                  onKeyDown={(e) => handleNavKeyDown(e, 3)}
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 mr-1 transition-transform duration-300",
                      !inventoryExpanded && "transform -rotate-90"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    <span>Inventory Management</span>
                  </span>
                  <VisuallyHidden>
                    {inventoryExpanded ? "Collapse section" : "Expand section"}
                  </VisuallyHidden>
                </div>

                {inventoryExpanded && (
                  <div
                    id="inventory-items"
                    className="mt-1 space-y-1 pl-7 overflow-hidden transition-all duration-500 ease-in-out"
                    style={{ maxHeight: inventoryExpanded ? "500px" : "0" }}
                    role="group"
                    aria-label="Inventory Management Items"
                  >
                    <NavigationItem
                      label="Inventory"
                      href="/inventory"
                      active={pathname === "/inventory"}
                      parentSection="inventory"
                      refCallback={(el) => {
                        if (el) navRefs.current[4] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 4)}
                      navIndex={4}
                      focusIndex={focusIndex}
                    />
                    <NavigationItem
                      label="Suppliers"
                      href="/suppliers"
                      active={pathname === "/suppliers"}
                      parentSection="inventory"
                      refCallback={(el) => {
                        if (el) navRefs.current[5] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 5)}
                      navIndex={5}
                      focusIndex={focusIndex}
                    />
                    <NavigationItem
                      label="Shopping List"
                      href="/shopping-list"
                      active={pathname === "/shopping-list"}
                      parentSection="inventory"
                      refCallback={(el) => {
                        if (el) navRefs.current[6] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 6)}
                      navIndex={6}
                      focusIndex={focusIndex}
                    />
                  </div>
                )}
              </>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      className="relative p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out"
                      onClick={() => toggleSection("inventory")}
                      tabIndex={0}
                      role="button"
                      aria-label="Inventory Management"
                      aria-expanded={inventoryExpanded}
                      data-section="inventory"
                      ref={(el) => {
                        if (el) navRefs.current[3] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 3)}
                    >
                      <span className="text-lg">📦</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>
                      Inventory Management{" "}
                      <span className="text-xs opacity-70">(→ to expand)</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Menu & Sales Section */}
          <div className={!isOpen ? "w-full flex justify-center" : ""}>
            {isOpen ? (
              <>
                <div
                  className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                  onClick={() => toggleSection("menuSales")}
                  tabIndex={0}
                  role="button"
                  aria-expanded={menuSalesExpanded}
                  aria-controls="menu-sales-items"
                  data-section="menuSales"
                  ref={(el) => {
                    if (el) navRefs.current[7] = el;
                  }}
                  onKeyDown={(e) => handleNavKeyDown(e, 7)}
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 mr-1 transition-transform duration-300",
                      !menuSalesExpanded && "transform -rotate-90"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span className="text-lg">👨‍🍳</span>
                    <span>Menu & Sales</span>
                  </span>
                  <VisuallyHidden>
                    {menuSalesExpanded ? "Collapse section" : "Expand section"}
                  </VisuallyHidden>
                </div>

                {menuSalesExpanded && (
                  <div
                    id="menu-sales-items"
                    className="mt-1 space-y-1 pl-7 overflow-hidden transition-all duration-500 ease-in-out"
                    style={{ maxHeight: menuSalesExpanded ? "500px" : "0" }}
                    role="group"
                    aria-label="Menu and Sales Items"
                  >
                    <NavigationItem
                      label="Recipes"
                      href="/recipes"
                      active={pathname === "/recipes"}
                      parentSection="menuSales"
                      refCallback={(el) => {
                        if (el) navRefs.current[8] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 8)}
                      navIndex={8}
                      focusIndex={focusIndex}
                    />
                    <NavigationItem
                      label="Sales"
                      href="/sales"
                      active={pathname === "/sales"}
                      parentSection="menuSales"
                      refCallback={(el) => {
                        if (el) navRefs.current[9] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 9)}
                      navIndex={9}
                      focusIndex={focusIndex}
                    />
                  </div>
                )}
              </>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      className="relative p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out"
                      onClick={() => toggleSection("menuSales")}
                      tabIndex={0}
                      role="button"
                      aria-label="Menu and Sales"
                      aria-expanded={menuSalesExpanded}
                      data-section="menuSales"
                      ref={(el) => {
                        if (el) navRefs.current[7] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 7)}
                    >
                      <span className="text-lg">👨‍🍳</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>
                      Menu & Sales{" "}
                      <span className="text-xs opacity-70">(→ to expand)</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Analytics Section */}
          <div className={!isOpen ? "w-full flex justify-center" : ""}>
            {isOpen ? (
              <>
                <div
                  className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                  onClick={() => toggleSection("analytics")}
                  tabIndex={0}
                  role="button"
                  aria-expanded={analyticsExpanded}
                  aria-controls="analytics-items"
                  data-section="analytics"
                  ref={(el) => {
                    if (el) navRefs.current[10] = el;
                  }}
                  onKeyDown={(e) => handleNavKeyDown(e, 10)}
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 mr-1 transition-transform duration-300",
                      !analyticsExpanded && "transform -rotate-90"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span>Analytics</span>
                  </span>
                  <VisuallyHidden>
                    {analyticsExpanded ? "Collapse section" : "Expand section"}
                  </VisuallyHidden>
                </div>

                {analyticsExpanded && (
                  <div
                    id="analytics-items"
                    className="mt-1 space-y-1 pl-7 overflow-hidden transition-all duration-500 ease-in-out"
                    style={{ maxHeight: analyticsExpanded ? "500px" : "0" }}
                    role="group"
                    aria-label="Analytics Items"
                  >
                    <NavigationItem
                      label="Reports"
                      href="/reports"
                      active={pathname === "/reports"}
                      parentSection="analytics"
                      refCallback={(el) => {
                        if (el) navRefs.current[11] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 11)}
                      navIndex={11}
                      focusIndex={focusIndex}
                    />
                    <NavigationItem
                      label="Notes"
                      href="/notes"
                      active={pathname === "/notes"}
                      parentSection="analytics"
                      refCallback={(el) => {
                        if (el) navRefs.current[12] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 12)}
                      navIndex={12}
                      focusIndex={focusIndex}
                    />
                  </div>
                )}
              </>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      className="relative p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out"
                      onClick={() => toggleSection("analytics")}
                      tabIndex={0}
                      role="button"
                      aria-label="Analytics"
                      aria-expanded={analyticsExpanded}
                      data-section="analytics"
                      ref={(el) => {
                        if (el) navRefs.current[10] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 10)}
                    >
                      <span className="text-lg">📊</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>
                      Analytics{" "}
                      <span className="text-xs opacity-70">(→ to expand)</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Administration Section */}
          <div className={!isOpen ? "w-full flex justify-center" : ""}>
            {isOpen ? (
              <>
                <div
                  className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                  onClick={() => toggleSection("admin")}
                  tabIndex={0}
                  role="button"
                  aria-expanded={adminExpanded}
                  aria-controls="admin-items"
                  data-section="admin"
                  ref={(el) => {
                    if (el) navRefs.current[13] = el;
                  }}
                  onKeyDown={(e) => handleNavKeyDown(e, 13)}
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 mr-1 transition-transform duration-300",
                      !adminExpanded && "transform -rotate-90"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    <span>Administration</span>
                  </span>
                  <VisuallyHidden>
                    {adminExpanded ? "Collapse section" : "Expand section"}
                  </VisuallyHidden>
                </div>

                {adminExpanded && (
                  <div
                    id="admin-items"
                    className="mt-1 space-y-1 pl-7 overflow-hidden transition-all duration-500 ease-in-out"
                    style={{ maxHeight: adminExpanded ? "500px" : "0" }}
                    role="group"
                    aria-label="Administration Items"
                  >
                    <NavigationItem
                      label="Users"
                      href="/users"
                      active={pathname === "/users"}
                      parentSection="admin"
                      refCallback={(el) => {
                        if (el) navRefs.current[14] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 14)}
                      navIndex={14}
                      focusIndex={focusIndex}
                    />
                    <NavigationItem
                      label="Billing"
                      href="/billing"
                      active={pathname === "/billing"}
                      parentSection="admin"
                      refCallback={(el) => {
                        if (el) navRefs.current[15] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 15)}
                      navIndex={15}
                      focusIndex={focusIndex}
                    />
                    <NavigationItem
                      label="Settings"
                      href="/settings"
                      active={pathname === "/settings"}
                      parentSection="admin"
                      refCallback={(el) => {
                        if (el) navRefs.current[16] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 16)}
                      navIndex={16}
                      focusIndex={focusIndex}
                    />
                  </div>
                )}
              </>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      className="relative p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out"
                      onClick={() => toggleSection("admin")}
                      tabIndex={0}
                      role="button"
                      aria-label="Administration"
                      aria-expanded={adminExpanded}
                      data-section="admin"
                      ref={(el) => {
                        if (el) navRefs.current[13] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 13)}
                    >
                      <span className="text-lg">👥</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>
                      Administration{" "}
                      <span className="text-xs opacity-70">(→ to expand)</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Logout Button */}
          <div className={!isOpen ? "w-full flex justify-center" : ""}>
            {isOpen ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg text-sm transition-all duration-300 ease-in-out px-2 py-1.5 w-full hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                ref={(el) => {
                  if (el) navRefs.current[18] = el;
                }}
                onKeyDown={(e) => handleNavKeyDown(e, 18)}
                tabIndex={0}
              >
                <span className="text-lg" aria-hidden="true">
                  🚪
                </span>
                <span>Logout</span>
              </button>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center p-2 rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
                      ref={(el) => {
                        if (el) navRefs.current[18] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 18)}
                      tabIndex={0}
                    >
                      <span className="text-lg" aria-hidden="true">
                        🚪
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Footer section - fixed at bottom */}
        <div
          className={cn(
            "border-t border-gray-200 dark:border-gray-800 p-3 mt-auto",
            !isOpen && "w-full flex flex-col items-center"
          )}
        >
          {/* Help Section */}
          <div className={!isOpen ? "w-full flex justify-center" : "mb-3"}>
            {isOpen ? (
              <NavigationItem
                icon="❓"
                label="Help"
                href="/help"
                active={pathname === "/help"}
                refCallback={(el) => {
                  if (el) navRefs.current[17] = el;
                }}
                onKeyDown={(e) => handleNavKeyDown(e, 17)}
                navIndex={17}
                focusIndex={focusIndex}
              />
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link
                      href="/help"
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800",
                        pathname === "/help" &&
                          "bg-primary/10 text-primary dark:bg-primary/20"
                      )}
                      ref={(el) => {
                        if (el) navRefs.current[17] = el;
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, 17)}
                      tabIndex={0}
                    >
                      <span className="text-lg" aria-hidden="true">
                        ❓
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Help</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Keyboard Shortcuts - only when expanded */}
          {isOpen && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 space-y-2">
              <div className="text-sm font-medium mb-1">Keyboard Shortcuts</div>
              <div className="flex justify-between">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                    K
                  </kbd>
                </span>
                <span>Search</span>
              </div>
              <div className="flex justify-between">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                    B
                  </kbd>
                </span>
                <span>Toggle sidebar</span>
              </div>
              <div className="flex justify-between">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                    J
                  </kbd>
                </span>
                <span>Focus sidebar</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

interface NavigationItemProps {
  icon?: React.ReactNode | string;
  label?: string;
  href: string;
  active?: boolean;
  indicator?: React.ReactNode;
  collapsedMode?: boolean;
  refCallback?: (el: HTMLAnchorElement | null) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  navIndex?: number;
  focusIndex?: number;
  parentSection?: string;
}

function NavigationItem({
  icon,
  label,
  href,
  active,
  indicator,
  collapsedMode,
  refCallback,
  onKeyDown,
  navIndex,
  focusIndex,
  parentSection,
}: NavigationItemProps) {
  return (
    <div className="relative">
      {indicator}
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 rounded-lg text-sm transition-all duration-300 ease-in-out",
          collapsedMode ? "p-2" : "px-2 py-1.5",
          active
            ? "bg-gray-100 dark:bg-gray-800 font-medium"
            : "hover:bg-gray-100 dark:hover:bg-gray-800",
          navIndex === focusIndex && "ring-2 ring-primary ring-offset-1"
        )}
        ref={refCallback}
        onKeyDown={onKeyDown}
        tabIndex={0}
        data-parent-section={parentSection}
        aria-current={active ? "page" : undefined}
      >
        {typeof icon === "string" ? (
          <span className="text-lg" aria-hidden="true">
            {icon}
          </span>
        ) : (
          icon && <span aria-hidden="true">{icon}</span>
        )}
        {!collapsedMode && label && <span>{label}</span>}
      </Link>
    </div>
  );
}
