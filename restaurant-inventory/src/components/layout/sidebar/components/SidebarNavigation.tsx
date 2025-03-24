"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "../types";
import { hasChildren } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SidebarNavigationProps {
  open: boolean;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  navItems: NavItem[];
}

export function SidebarNavigation({
  open,
  expandedSections,
  toggleSection,
  navItems,
}: SidebarNavigationProps) {
  const pathname = usePathname();
  const [hoveredSection, setHoveredSection] = React.useState<string | null>(
    null
  );

  return (
    <TooltipProvider>
      <nav className={cn("px-3 py-1 space-y-1.5 overflow-y-auto max-h-full", open ? "px-3" : "px-2")}>
        {navItems.map((item) => {
          if (hasChildren(item)) {
            const isExpanded = expandedSections[item.name] || false;
            const hasActiveChild = item.items.some(
              (child) =>
                "href" in child &&
                typeof child.href === "string" &&
                pathname.startsWith(child.href)
            );

            // For collapsed sidebar with hover functionality
            if (!open) {
              return (
                <Popover
                  key={item.name}
                  open={hoveredSection === item.name}
                  onOpenChange={(isOpen) => {
                    setHoveredSection(isOpen ? item.name : null);
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-center w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        "hover:bg-gray-100 hover:text-orange-500",
                        hasActiveChild
                          ? "text-orange-500 bg-orange-50/80 border-l-2 border-orange-500"
                          : "text-gray-700",
                        item.className
                      )}
                    >
                      {item.icon && (
                        <item.icon className="h-5 w-5 shrink-0" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    align="start"
                    className="p-0 w-48 rounded-md border border-gray-200 shadow-md"
                    onInteractOutside={() => setHoveredSection(null)}
                  >
                    <div className="bg-white py-1 rounded-md">
                      <div className="px-3 py-2 text-sm font-medium text-orange-500 border-b border-gray-200 mb-1">
                        {item.name}
                      </div>
                      {item.items.map((child) => {
                        if ("href" in child) {
                          const childHref =
                            typeof child.href === "string" ? child.href : "#";
                          const isActive =
                            childHref !== "#" && pathname.startsWith(childHref);
                          return (
                            <Link
                              key={child.name}
                              href={childHref}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm transition-colors",
                                isActive
                                  ? "text-orange-500 bg-orange-50/80 font-medium"
                                  : "text-gray-700 hover:text-orange-500 hover:bg-gray-50",
                                child.className
                              )}
                              onClick={() => setHoveredSection(null)}
                            >
                              {child.icon && (
                                <child.icon className="h-4 w-4 mr-2 shrink-0" />
                              )}
                              {child.name}
                            </Link>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            // For expanded sidebar
            return (
              <div key={item.name} className={item.className}>
                <button
                  onClick={() => toggleSection(item.name)}
                  className={cn(
                    "flex items-center justify-between w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    "hover:bg-gray-100 hover:text-orange-500",
                    hasActiveChild
                      ? "text-orange-500 bg-orange-50/80 border-l-2 border-orange-500"
                      : "text-gray-700",
                    item.className
                  )}
                >
                  <div className="flex items-center">
                    {item.icon && (
                      <item.icon
                        className={cn("h-5 w-5 shrink-0", {
                          "mr-2.5": open,
                        })}
                      />
                    )}
                    {open && <span>{item.name}</span>}
                  </div>
                  {open && (
                    <ChevronDownIcon
                      className={cn("h-4 w-4 transition-transform", {
                        "transform rotate-180": isExpanded,
                      })}
                    />
                  )}
                </button>

                {open && isExpanded && (
                  <div
                    className={cn(
                      "pl-10 space-y-1 mt-1",
                      !isExpanded && "hidden"
                    )}
                  >
                    {item.items.map((child) => {
                      if ("href" in child) {
                        const childHref =
                          typeof child.href === "string" ? child.href : "#";
                        const isActive =
                          childHref !== "#" && pathname.startsWith(childHref);
                        return (
                          <Link
                            key={child.name}
                            href={childHref}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                              isActive
                                ? "text-orange-500 bg-orange-50/80 font-medium"
                                : "text-gray-700 hover:text-orange-500 hover:bg-gray-50",
                              child.className
                            )}
                          >
                            {child.icon && (
                              <child.icon className="h-4 w-4 mr-2.5 shrink-0" />
                            )}
                            {child.name}
                          </Link>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single item
          if ("href" in item) {
            const itemHref = typeof item.href === "string" ? item.href : "#";
            const isActive = itemHref !== "#" && pathname.startsWith(itemHref);

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={itemHref}
                    className={cn(
                      "flex items-center w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      "hover:bg-gray-100 hover:text-orange-500",
                      isActive
                        ? "text-orange-500 bg-orange-50/80 border-l-2 border-orange-500"
                        : "text-gray-700",
                      !open && "justify-center",
                      item.className
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn("h-5 w-5 shrink-0", {
                          "mr-2.5": open,
                        })}
                      />
                    )}
                    {open && <span>{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {!open && (
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          }

          return null;
        })}
      </nav>
    </TooltipProvider>
  );
}
