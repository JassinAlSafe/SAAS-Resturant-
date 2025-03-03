"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import useSafeMediaQueries from "@/hooks/use-media-query";
import { useAuth } from "@/lib/auth-context";
import { useTransition } from "@/components/ui/transition";
import { LogOutIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart,
  FileText,
  Home,
  Landmark,
  Package,
  Settings,
  ShoppingCart,
  Utensils,
  Package2,
  BarChart2,
  ClipboardCheck,
  Info,
  Users,
  Bell,
  Store,
  Star,
  FileSpreadsheet,
  ChevronRight,
  ListChecks,
  BookOpen,
  Sparkles,
  CreditCard,
  ListIcon,
  Wallet,
  Layers,
} from "lucide-react";

import { NavItem, hasChildren, SidebarContextType } from "./types";
import { navItems } from "./nav-items";

export function Navigation({
  sidebarContext,
}: {
  sidebarContext?: SidebarContextType;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const { isMobile, isTablet } = useSafeMediaQueries();
  const navRef = React.useRef<HTMLDivElement>(null);
  const { signOut, profile } = useAuth();
  const { startTransition } = useTransition();

  // Use either the provided sidebarContext or the store
  const open = sidebarContext?.open ?? isOpen;

  // Track if sections are collapsed
  const [collapsedSections, setCollapsedSections] = React.useState<
    Record<string, boolean>
  >({});

  // Track if nav needs a scroll indicator
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);

  // Check if we need to show scroll indicator
  React.useEffect(() => {
    const checkScroll = () => {
      if (navRef.current) {
        const { scrollHeight, clientHeight } = navRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // Add keyboard shortcuts for navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If Alt key is pressed with another key
      if (e.altKey) {
        // Map keys to routes
        const keyMap: Record<string, string> = {
          d: "/dashboard",
          i: "/inventory",
          m: "/menu",
          s: "/settings",
          r: "/reports",
          u: "/users",
        };

        const key = e.key.toLowerCase();
        if (keyMap[key]) {
          e.preventDefault();
          router.push(keyMap[key]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Toggle a section's collapsed state
  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Check if a nav item or its children are active
  const isChildActive = (items: NavItem[]): boolean => {
    return items.some((item) => {
      if (hasChildren(item)) {
        return isChildActive(item.items);
      }
      return pathname === item.href || pathname.startsWith(item.href + "/");
    });
  };

  // Get keyboard shortcut display for an item
  const getShortcutKey = (path: string): string | null => {
    const shortcuts: Record<string, string> = {
      "/dashboard": "Alt+D",
      "/inventory": "Alt+I",
      "/menu": "Alt+M",
      "/settings": "Alt+S",
      "/reports": "Alt+R",
      "/users": "Alt+U",
    };

    return shortcuts[path] || null;
  };

  // Initialize expanded sections based on active path
  React.useEffect(() => {
    const newCollapsedSections = { ...collapsedSections };
    let hasChanges = false;

    navItems.forEach((item) => {
      if (hasChildren(item)) {
        const shouldExpand = isChildActive(item.items);
        if (shouldExpand && collapsedSections[item.name]) {
          newCollapsedSections[item.name] = false;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setCollapsedSections(newCollapsedSections);
    }
  }, [pathname, collapsedSections]);

  const handleLogout = async () => {
    try {
      startTransition(() => {
        signOut()
          .then(() => {
            router.push("/login");
          })
          .catch((error) => {
            console.error("Error signing out:", error);
          });
      }, "logout");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Render a navigation item based on its properties
  const renderNavItem = (item: NavItem): React.ReactNode => {
    // If the item has children, render it as a collapsible section
    if (hasChildren(item)) {
      const isActive = isChildActive(item.items);
      const isCollapsed = collapsedSections[item.name] ?? false;

      return (
        <div key={item.name} className={cn("mb-1", item.className)}>
          <Collapsible
            open={!isCollapsed}
            onOpenChange={() => toggleSection(item.name)}
            className="w-full"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm",
                "hover:bg-accent/30 transition-colors duration-150",
                isActive ? "text-primary font-medium" : "text-foreground/70"
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-3 h-[18px] w-[18px]",
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  )}
                />
              )}
              {(open || isMobile || isTablet) && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 text-muted-foreground/50 transition-transform duration-200",
                      !isCollapsed ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </>
              )}
            </CollapsibleTrigger>

            <CollapsibleContent
              className={cn(
                "transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
                open || isMobile || isTablet ? "pl-8" : "pl-0"
              )}
            >
              <div className="space-y-1 py-1 relative">
                {item.items.map((child) => renderNavItem(child))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }

    // If it's a regular item (no children), render as a link
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const shortcutKey = getShortcutKey(item.href);

    // Check if this is a child item (no icon needed for children)
    const isChildItem = !hasChildren(item) && !item.icon;

    const itemContent = (
      <div
        className={cn(
          "flex w-full items-center rounded-md px-3 py-1.5 text-sm",
          "transition-colors duration-150",
          isActive ? "text-primary font-medium" : "text-foreground/70",
          isChildItem ? "pl-4" : "", // Reduced padding for child items
          isChildItem ? "hover:bg-accent/20" : "hover:bg-accent/30", // Lighter hover for child items
          item.className
        )}
      >
        {isChildItem && (
          <div
            className={cn(
              "mr-2 w-1 h-1 rounded-full",
              isActive ? "bg-primary" : "bg-muted-foreground/30"
            )}
          ></div>
        )}
        {item.icon && !isChildItem && (
          <item.icon
            className={cn(
              "mr-3 h-[18px] w-[18px]",
              isActive ? "text-primary" : "text-muted-foreground/60"
            )}
          />
        )}
        {(open || isMobile || isTablet) && (
          <>
            <span className="flex-1 truncate">{item.name}</span>
            {shortcutKey && (
              <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium opacity-60 group-hover:inline-flex">
                {shortcutKey}
              </kbd>
            )}
          </>
        )}
      </div>
    );

    // Wrap in Link if href exists
    return open || isMobile || isTablet ? (
      <Link key={item.name} href={item.href} className="group relative block">
        {itemContent}
      </Link>
    ) : (
      <Tooltip key={item.name} delayDuration={0}>
        <TooltipTrigger asChild>
          <Link href={item.href} className="block mb-1">
            {itemContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.name}
          {shortcutKey && (
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              {shortcutKey}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Close sidebar when navigating on mobile
  const handleNavigation = React.useCallback(() => {
    if (isMobile && !open) {
      // Implement the logic to close the sidebar on mobile
    }
  }, [isMobile, open]);

  // Is user admin or manager?
  const isAdminOrManager =
    profile?.role === "admin" || profile?.role === "manager";

  return (
    <div
      ref={navRef}
      className={cn(
        "py-2 px-2 space-y-1",
        showScrollIndicator &&
          "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-6 after:bg-gradient-to-t after:from-background after:to-transparent after:pointer-events-none"
      )}
    >
      {navItems.map((item) => renderNavItem(item))}

      {/* Logout button as a navigation item */}
      <div className="nav-item mt-8 border-t border-gray-200 pt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className={`
                sidebar-transition
                ${
                  open
                    ? "sidebar-expanded-item"
                    : "flex items-center justify-center h-10 w-10 mx-auto rounded-md"
                }
              `}
            >
              <LogOutIcon className="h-5 w-5 text-gray-500" />
              {open && (
                <span className="text-sm font-medium text-gray-900 ml-3">
                  Logout
                </span>
              )}
            </button>
          </TooltipTrigger>
          {!open && (
            <TooltipContent
              side="right"
              className="font-medium sidebar-tooltip"
            >
              Logout
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}
