"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarCollapseButtonProps {
  open: boolean;
  toggleSidebar: () => void;
}

export function SidebarCollapseButton({
  open,
  toggleSidebar,
}: SidebarCollapseButtonProps) {
  return (
    <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "h-10 w-10 rounded-full border border-border/40 bg-background shadow-md",
          "hover:bg-primary/10 hover:text-primary",
          "flex items-center justify-center"
        )}
      >
        {open ? (
          <ChevronLeftIcon className="h-3 w-3" />
        ) : (
          <ChevronRightIcon className="h-3 w-3" />
        )}
        <span className="sr-only">
          {open ? "Collapse sidebar" : "Expand sidebar"}
        </span>
      </Button>
    </div>
  );
}
