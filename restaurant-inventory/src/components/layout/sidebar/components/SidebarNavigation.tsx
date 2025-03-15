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
      <nav className="px-2 py-1 space-y-1 overflow-y-auto max-h-full">
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
                        "flex items-center justify-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-500",
                        hasActiveChild
                          ? "text-teal-500 bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500"
                          : "text-gray-600 dark:text-gray-400",
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
                    className="p-0 w-48 rounded-md border border-gray-200 dark:border-gray-800"
                    onInteractOutside={() => setHoveredSection(null)}
                  >
                    <div className="bg-white dark:bg-gray-900 py-1 rounded-md shadow-md">
                      <div className="px-3 py-2 text-sm font-medium text-teal-500 border-b border-gray-200 dark:border-gray-800 mb-1">
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
                                  ? "text-teal-500 bg-teal-50 dark:bg-teal-900/20 font-medium"
                                  : "text-gray-600 dark:text-gray-400 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-500",
                    hasActiveChild
                      ? "text-teal-500 bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500"
                      : "text-gray-600 dark:text-gray-400",
                    !open && "justify-center"
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn("h-5 w-5 shrink-0", {
                        "mr-2": open,
                      })}
                    />
                  )}
                  {open && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDownIcon
                        className={cn("h-4 w-4 transition-transform", {
                          "transform rotate-180": isExpanded,
                        })}
                      />
                    </>
                  )}
                </button>

                {open && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
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
                              "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "text-teal-500 bg-teal-50 dark:bg-teal-900/20 font-medium border-l-2 border-teal-500"
                                : "text-gray-600 dark:text-gray-400 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
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
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-teal-500 bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500"
                        : "text-gray-600 dark:text-gray-400 hover:text-teal-500 hover:bg-gray-100 dark:hover:bg-gray-800",
                      !open && "justify-center",
                      item.className
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn("h-5 w-5 shrink-0", {
                          "mr-2": open,
                        })}
                      />
                    )}
                    {open && <span>{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {!open && (
                  <TooltipContent side="right">{item.name}</TooltipContent>
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
