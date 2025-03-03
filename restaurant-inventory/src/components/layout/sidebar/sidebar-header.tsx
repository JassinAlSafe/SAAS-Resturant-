"use client";

import * as React from "react";
import { BookOpenIcon } from "lucide-react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import useSafeMediaQueries from "@/hooks/use-media-query";

export function SidebarHeader() {
  const { isOpen } = useSidebarStore();
  const { isMobile, isTablet } = useSafeMediaQueries();

  return (
    <div
      className={cn(
        "flex items-center p-3",
        !isOpen && !isMobile && !isTablet && "justify-center"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/90 text-white">
          <BookOpenIcon className="h-4 w-4" />
        </div>
        {(isOpen || isMobile || isTablet) && (
          <span className="font-medium text-foreground">ShelfWise</span>
        )}
      </div>
    </div>
  );
}
