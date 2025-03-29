"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface SidebarCollapseButtonProps {
  open: boolean;
  toggleSidebar: () => void;
}

export function SidebarCollapseButton({
  open,
  toggleSidebar,
}: SidebarCollapseButtonProps) {
  return (
    <div className="absolute -right-3 top-20 z-[100]">
      <Tooltip
        content={open ? "Collapse sidebar" : "Expand sidebar"}
        position="right"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-7 w-7 p-0 rounded-full",
            "bg-orange-500 border-orange-400",
            "text-white shadow-md",
            "hover:bg-orange-600 hover:border-orange-500",
            "active:scale-95",
            "flex items-center justify-center transition-all duration-200"
          )}
        >
          {open ? (
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          ) : (
            <ChevronRightIcon className="h-3.5 w-3.5" />
          )}
          <span className="sr-only">
            {open ? "Collapse sidebar" : "Expand sidebar"}
          </span>
        </Button>
      </Tooltip>
    </div>
  );
}
