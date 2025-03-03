"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, Menu } from "lucide-react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { HeaderSearch } from "./header-search";

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
        return {
          label: path.charAt(0).toUpperCase() + path.slice(1),
          path: url,
        };
      }),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div
      className={cn(
        "h-screen overflow-auto w-full",
        "transition-all duration-500 ease-in-out"
      )}
      style={{
        marginLeft: isOpen ? "16rem" : "4rem",
        width: "calc(100vw - " + (isOpen ? "16rem" : "4rem") + ")",
      }}
    >
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center h-14 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="mr-2"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          {/* Breadcrumb navigation */}
          <div className="flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && (
                  <ChevronRightIcon size={14} className="mx-1 text-gray-400" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="text-gray-500 hover:text-primary transition-colors duration-200"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="min-h-screen pt-4 px-6">{children}</main>
    </div>
  );
}
