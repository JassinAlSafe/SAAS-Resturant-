"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, Menu, Search, Bell } from "lucide-react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Removing unused import to fix linter error
// import { HeaderSearch } from "./header-search";

interface DesktopContentProps {
  children: React.ReactNode;
}

export function DesktopContent({ children }: DesktopContentProps) {
  const { isOpen, toggle } = useSidebarStore();
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const getBreadcrumbs = () => {
    if (pathname === "/" || pathname === "/dashboard") {
      return [{ label: "Dashboard", path: "/dashboard" }];
    }

    const paths = pathname.split("/").filter(Boolean);

    return [
      { label: "Dashboard", path: "/dashboard" },
      ...paths.map((path, index) => {
        const url = `/${paths.slice(0, index + 1).join("/")}`;
        // Format path to be more readable (e.g., "inventory-management" -> "Inventory Management")
        const formattedLabel = path
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return {
          label: formattedLabel,
          path: url,
        };
      }),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div
      className={cn(
        "h-screen overflow-auto w-full transition-all duration-300 ease-in-out bg-background"
      )}
      style={{
        marginLeft: isOpen ? "16rem" : "4rem",
        width: "calc(100vw - " + (isOpen ? "16rem" : "4rem") + ")",
      }}
    >
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 flex items-center h-16 px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          {/* Enhanced breadcrumb navigation */}
          <nav aria-label="Breadcrumb" className="hidden md:block">
            <ol className="flex items-center text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && (
                    <ChevronRightIcon
                      size={14}
                      className="mx-1.5 text-muted-foreground/70"
                    />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Show current page on mobile */}
          <div className="md:hidden text-base font-medium">
            {breadcrumbs[breadcrumbs.length - 1].label}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Global search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              className="w-[180px] pl-9 h-9 bg-muted/40 border-muted-foreground/20 focus-visible:bg-background"
            />
          </div>

          {/* Notifications button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <div className="p-2 font-semibold border-b">Notifications</div>
              <DropdownMenuItem className="flex items-start cursor-pointer h-auto p-3">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">New inventory alert</span>
                  <span className="text-xs text-muted-foreground">
                    4 items need restocking
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    10 minutes ago
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 ml-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="min-h-screen pt-6 px-6 pb-12">{children}</main>
    </div>
  );
}
