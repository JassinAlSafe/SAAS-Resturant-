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
import useSafeMediaQueries from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { NavItem, hasChildren } from "./types";
import { navItems } from "./nav-items";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const { isMobile } = useSafeMediaQueries();
  const navRef = React.useRef<HTMLDivElement>(null);

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

  // Render a navigation item based on its properties
  const renderNavItem = (item: NavItem): React.ReactNode => {
    // If the item has children, render it as a collapsible section
    if (hasChildren(item)) {
      const isActive = isChildActive(item.items);
      const isCollapsed = collapsedSections[item.name] ?? false;

      return (
        <div key={item.name} className="group relative">
          {/* Section connector line for visual grouping */}
          {isOpen && !isCollapsed && (
            <div className="absolute left-3 top-8 bottom-2 w-px bg-border/40 -z-10" />
          )}

          <Collapsible
            open={!isCollapsed}
            onOpenChange={() => toggleSection(item.name)}
            className="w-full"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center px-2 py-1.5 text-sm transition-colors",
                "hover:bg-accent/50 rounded-md group relative",
                isActive && "text-primary font-medium"
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-2 h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              )}
              {isOpen && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  <ChevronDownIcon
                    className={cn(
                      "ml-1 h-4 w-4 transition-transform text-muted-foreground",
                      !isCollapsed ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </>
              )}
            </CollapsibleTrigger>

            <CollapsibleContent
              className={cn(
                "pl-8 pr-2 transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
                isOpen ? "mt-1" : "mt-0"
              )}
            >
              {item.items.map((child) => renderNavItem(child))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }

    // If it's a regular item (no children), render as a link
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const shortcutKey = getShortcutKey(item.href);

    const itemContent = (
      <div
        className={cn(
          "group flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors",
          "hover:bg-accent/50 hover:translate-x-1 duration-200",
          isActive &&
            "bg-accent font-medium text-accent-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r-sm before:bg-primary"
        )}
      >
        {item.icon && (
          <item.icon
            className={cn(
              "mr-2 h-4 w-4",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}
        {isOpen && (
          <>
            <span className="flex-1 truncate">{item.name}</span>
            {shortcutKey && (
              <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-70 group-hover:inline-flex">
                {shortcutKey}
              </kbd>
            )}
          </>
        )}
      </div>
    );

    // Wrap in Link if href exists
    return isOpen ? (
      <Link
        key={item.name}
        href={item.href}
        className={cn("relative", isActive && "relative")}
      >
        {itemContent}
      </Link>
    ) : (
      <Tooltip key={item.name} delayDuration={0}>
        <TooltipTrigger asChild>
          <Link href={item.href} className="relative">
            {itemContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.name}
          {shortcutKey && (
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              {shortcutKey}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Render a navigation item for mobile display
  const renderMobileNavItem = (item: NavItem): React.ReactNode => {
    if (hasChildren(item)) {
      return (
        <div key={item.name} className="mb-2">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {item.name}
          </div>
          <div className="space-y-1">
            {item.items.map((child) => renderMobileNavItem(child))}
          </div>
        </div>
      );
    }

    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const shortcutKey = getShortcutKey(item.href);

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50",
          isActive &&
            "bg-accent font-medium text-accent-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r-sm before:bg-primary"
        )}
      >
        {item.icon && (
          <item.icon
            className={cn(
              "h-4 w-4",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}
        <span>{item.name}</span>
        {shortcutKey && (
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-70">
            {shortcutKey}
          </kbd>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop navigation */}
      <div
        ref={navRef}
        className={cn(
          "hide-scrollbar relative flex flex-col gap-1 overflow-y-auto py-2",
          isOpen ? "px-3" : "px-2",
          showScrollIndicator && "mask-bottom-fade"
        )}
      >
        {navItems.map((item) => renderNavItem(item))}
        {showScrollIndicator && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {/* Mobile navigation when the sidebar is collapsed but shown on mobile */}
      {isMobile && !isOpen && (
        <div className="flex flex-col gap-1 p-2 overflow-y-auto">
          {navItems.map((item) => renderMobileNavItem(item))}
        </div>
      )}
    </>
  );
}
