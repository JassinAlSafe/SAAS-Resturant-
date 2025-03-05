"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PanelLeftCloseIcon,
  PanelLeftIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-10 w-10 rounded-full border border-border/40 bg-background shadow-md",
                "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
                "flex items-center justify-center transition-all duration-200"
              )}
            >
              {open ? (
                <PanelLeftCloseIcon className="h-4 w-4" />
              ) : (
                <PanelLeftIcon className="h-4 w-4" />
              )}
              <span className="sr-only">
                {open ? "Collapse sidebar" : "Expand sidebar"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {open ? "Collapse sidebar" : "Expand sidebar"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
