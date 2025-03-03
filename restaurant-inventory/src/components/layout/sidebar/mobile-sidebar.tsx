"use client";

import * as React from "react";
import { Menu, ChevronLeft, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar-header";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useAuth } from "@/lib/auth-context";

export function MobileSidebar() {
  const { openMobile, setMobileOpen, expandedSections, toggleSection } =
    useSidebarStore();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = React.useState(false);
  const inventoryExpanded = expandedSections["inventory"] !== false;
  const menuSalesExpanded = expandedSections["menuSales"] !== false;
  const analyticsExpanded = expandedSections["analytics"] !== false;
  const adminExpanded = expandedSections["admin"] !== false;

  const openNav = React.useCallback(() => setMobileOpen(true), [setMobileOpen]);
  const closeNav = React.useCallback(
    () => setMobileOpen(false),
    [setMobileOpen]
  );

  // Set mounted state after hydration
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle logout
  const handleLogout = React.useCallback(async () => {
    try {
      await signOut();
      closeNav();
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut, closeNav]);

  // Touch gesture handling
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe && openMobile) {
      closeNav();
    }
  };

  // Close sidebar when clicking outside
  React.useEffect(() => {
    if (!hasMounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        openMobile
      ) {
        closeNav();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMobile, closeNav, hasMounted]);

  // Wait until hydration completes before rendering client-specific elements
  if (!hasMounted) {
    return null;
  }

  return (
    <>
      {/* Mobile sidebar button */}
      <Button
        onClick={openNav}
        variant="ghost"
        size="icon"
        className="md:hidden relative z-20 bg-card/70 backdrop-blur-sm hover:bg-card/90"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar Backdrop - Shown when sidebar is open */}
      {hasMounted && openMobile && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeNav}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card shadow-xl transform transition-transform duration-300 ease-in-out",
          openMobile ? "translate-x-0" : "-translate-x-full"
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        ref={sidebarRef}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <SidebarHeader />
              <Button
                onClick={closeNav}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Close menu"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Scrollable Area */}
          <div className="flex-1 overflow-auto p-3 pt-4">
            {/* Search Bar */}
            <div className="relative mb-6 px-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full pl-9 h-9 bg-muted/50"
              />
            </div>

            {/* Main Navigation */}
            <div className="space-y-1 w-full">
              <NavigationItem
                icon="🏠"
                label="Dashboard"
                href="/dashboard"
                active={pathname === "/dashboard"}
              />
            </div>

            {/* Inventory Management Section */}
            <div>
              <div
                className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                onClick={() => toggleSection("inventory")}
                tabIndex={0}
                role="button"
                aria-expanded={inventoryExpanded}
                aria-controls="inventory-items"
                data-section="inventory"
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
                  />
                  <NavigationItem
                    label="Suppliers"
                    href="/suppliers"
                    active={pathname === "/suppliers"}
                    parentSection="inventory"
                  />
                  <NavigationItem
                    label="Shopping List"
                    href="/shopping-list"
                    active={pathname === "/shopping-list"}
                    parentSection="inventory"
                  />
                </div>
              )}
            </div>

            {/* Menu & Sales Section */}
            <div>
              <div
                className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                onClick={() => toggleSection("menuSales")}
                tabIndex={0}
                role="button"
                aria-expanded={menuSalesExpanded}
                aria-controls="menu-sales-items"
                data-section="menuSales"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 mr-1 transition-transform duration-300",
                    !menuSalesExpanded && "transform -rotate-90"
                  )}
                />
                <span className="flex items-center gap-2">
                  <span className="text-lg">🛒</span>
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
                  aria-label="Menu & Sales Items"
                >
                  <NavigationItem
                    label="Recipes"
                    href="/recipes"
                    active={pathname === "/recipes"}
                    parentSection="menuSales"
                  />
                  <NavigationItem
                    label="Sales"
                    href="/sales"
                    active={pathname === "/sales"}
                    parentSection="menuSales"
                  />
                </div>
              )}
            </div>

            {/* Analytics Section */}
            <div>
              <div
                className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                onClick={() => toggleSection("analytics")}
                tabIndex={0}
                role="button"
                aria-expanded={analyticsExpanded}
                aria-controls="analytics-items"
                data-section="analytics"
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
                  />
                  <NavigationItem
                    label="Notes"
                    href="/notes"
                    active={pathname === "/notes"}
                    parentSection="analytics"
                  />
                </div>
              )}
            </div>

            {/* Administration Section */}
            <div>
              <div
                className="flex items-center text-gray-600 dark:text-gray-300 text-sm px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-all duration-300 ease-in-out"
                onClick={() => toggleSection("admin")}
                tabIndex={0}
                role="button"
                aria-expanded={adminExpanded}
                aria-controls="admin-items"
                data-section="admin"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 mr-1 transition-transform duration-300",
                    !adminExpanded && "transform -rotate-90"
                  )}
                />
                <span className="flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
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
                  />
                  <NavigationItem
                    label="Billing"
                    href="/billing"
                    active={pathname === "/billing"}
                    parentSection="admin"
                  />
                  <NavigationItem
                    label="Settings"
                    href="/settings"
                    active={pathname === "/settings"}
                    parentSection="admin"
                  />
                  <NavigationItem
                    label="Help"
                    href="/help"
                    active={pathname === "/help"}
                    parentSection="admin"
                  />
                </div>
              )}
            </div>

            {/* User Actions Section */}
            <div className="mt-8 space-y-2 px-1">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-3">
                USER ACTIONS
              </p>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                </span>
                <span>Logout</span>
              </button>
            </div>

            {/* Footer section - fixed at bottom */}
            <div className="border-t border-border/40 p-4 mt-8">
              {/* Swipe indicator */}
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-10 h-1 bg-muted-foreground/10 rounded-full"></span>
                <span>Swipe left to close</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface NavigationItemProps {
  icon?: React.ReactNode | string;
  label?: string;
  href: string;
  active?: boolean;
  indicator?: React.ReactNode;
  parentSection?: string;
}

function NavigationItem({
  icon,
  label,
  href,
  active,
  indicator,
  parentSection,
}: NavigationItemProps) {
  return (
    <div className="relative">
      {indicator}
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 rounded-lg text-sm transition-all duration-300 ease-in-out px-2 py-1.5",
          active
            ? "bg-gray-100 dark:bg-gray-800 font-medium"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
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
        {label && <span>{label}</span>}
      </Link>
    </div>
  );
}
