"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HomeIcon, ChevronRightIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

import { HeaderSearch } from "./header-search";
import { MobileSidebar } from "./mobile-sidebar";

interface MobileContentProps {
  children: React.ReactNode;
}

export function MobileContent({ children }: MobileContentProps) {
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
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <header className="sticky top-0 z-10 bg-sidebar border-b border-border/50 dark:border-border/30 px-4 flex items-center h-14">
        <div className="flex items-center">
          <div className="mr-2">
            <MobileSidebar />
          </div>
          <div className="text-lg font-semibold truncate flex items-center">
            <span className="text-primary mr-1">R</span>
            <span>{currentPage}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <HeaderSearch />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile breadcrumb navigation - simplified */}
      <div className="px-4 py-2 overflow-x-auto whitespace-nowrap flex items-center text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <HomeIcon size={14} className="mr-2 flex-shrink-0" />
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <ChevronRightIcon
                size={14}
                className="mx-1 text-gray-400 flex-shrink-0"
              />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="hover:text-primary transition-colors duration-200 truncate"
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
