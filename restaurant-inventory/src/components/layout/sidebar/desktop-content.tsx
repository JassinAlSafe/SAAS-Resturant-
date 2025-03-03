"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HomeIcon, ChevronRightIcon } from "lucide-react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

import { HeaderSearch } from "./header-search";

interface DesktopContentProps {
  children: React.ReactNode;
}

export function DesktopContent({ children }: DesktopContentProps) {
  const { isOpen } = useSidebarStore();
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
        "min-h-screen bg-gray-50 dark:bg-gray-900",
        "transition-all duration-300 ease-in-out",
        isOpen ? "ml-64" : "ml-16"
      )}
    >
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center h-14">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <HeaderSearch />
          <ThemeToggle />
        </div>
      </header>

      {/* Breadcrumb navigation */}
      <div className="px-4 py-2 flex items-center text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <HomeIcon size={14} className="mr-2" />
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <ChevronRightIcon size={14} className="mx-1 text-gray-400" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-700 dark:text-gray-300">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="hover:text-primary transition-colors duration-200"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
