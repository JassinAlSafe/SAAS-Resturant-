"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  BookOpenIcon,
  ChevronDownIcon,
  XIcon,
  LogOutIcon,
  UserIcon,
  Settings2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavItem } from "../types";
import { hasChildren } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MobileSidebarProps {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  navItems: NavItem[];
  businessName: string;
  logoUrl: string;
  handleLogout: () => void;
  user?: {
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
}

export function MobileSidebar({
  openMobile,
  setOpenMobile,
  expandedSections,
  toggleSection,
  navItems,
  businessName,
  logoUrl,
  handleLogout,
  user = { name: "User", email: "user@example.com", image: "", role: "User" },
}: MobileSidebarProps) {
  const pathname = usePathname();

  // Get role badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "staff":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {openMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 w-72 transition-transform duration-200 ease-in-out",
          "bg-card dark:bg-gray-950 border-r border-border/40 flex flex-col",
          openMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <Link href="/dashboard" className="flex items-center gap-3">
            {!logoUrl ? (
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary shadow-sm">
                <BookOpenIcon className="h-5 w-5" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-md overflow-hidden border border-border/40 shadow-sm">
                <Image
                  src={logoUrl}
                  alt={businessName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold truncate text-sm">
                {businessName}
              </span>
              <span className="text-xs text-muted-foreground">
                Inventory System
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* User Profile Section - Added at the top */}
        <div className="p-4 bg-muted/30 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                getRoleBadgeColor(user.role || "User")
              )}
            >
              {user.role || "User"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {}}
            >
              <UserIcon className="h-3 w-3 mr-1" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {}}
            >
              <Settings2Icon className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Make it scrollable */}
        <nav className="px-2 py-3 space-y-1 flex-1 overflow-y-auto">
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
                        ? "text-primary bg-primary/10 border-l-4 border-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.icon && (
                      <item.icon className="h-5 w-5 flex-shrink-0 mr-2" />
                    )}
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDownIcon
                      className={cn("h-4 w-4 transition-transform", {
                        "transform rotate-180": isExpanded,
                      })}
                    />
                  </button>

                  {isExpanded && (
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
                                  ? "text-primary bg-primary/10 font-medium border-l-2 border-primary"
                                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                              )}
                              onClick={() => setOpenMobile(false)}
                            >
                              {child.icon && (
                                <child.icon className="h-4 w-4 mr-2 flex-shrink-0" />
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
              const isActive =
                itemHref !== "#" && pathname.startsWith(itemHref);

              return (
                <Link
                  key={item.name}
                  href={itemHref}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary bg-primary/10 border-l-4 border-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                    item.className
                  )}
                  onClick={() => setOpenMobile(false)}
                >
                  {item.icon && (
                    <item.icon className="h-5 w-5 flex-shrink-0 mr-2" />
                  )}
                  <span>{item.name}</span>
                </Link>
              );
            }

            return null;
          })}
        </nav>

        {/* Mobile Bottom Actions */}
        <div className="border-t border-border/40 p-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
