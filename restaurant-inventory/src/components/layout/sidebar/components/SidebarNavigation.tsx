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

            return (
              <div key={item.name} className={item.className}>
                <button
                  onClick={() => toggleSection(item.name)}
                  className={cn(
                    "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    hasActiveChild
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground",
                    !open && "justify-center"
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn("h-4 w-4 flex-shrink-0", {
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
                                ? "text-primary bg-primary/10 font-medium"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                            )}
                          >
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
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                      !open && "justify-center",
                      item.className
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn("h-4 w-4 flex-shrink-0", {
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
