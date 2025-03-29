"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  color?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  open?: boolean;
  className?: string;
  contentClassName?: string;
};

// Provider component for context
const TooltipContext = React.createContext<{ open: boolean }>({ open: false });

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipContext.Provider value={{ open: false }}>
      {children}
    </TooltipContext.Provider>
  );
};

// Trigger component
type TooltipTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
};

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ children, asChild }, ref) => {
    return <div ref={ref}>{children}</div>;
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

// Content component
type TooltipContentProps = {
  children: React.ReactNode;
  className?: string;
};

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn("tooltip-content", className)}>
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

// Main tooltip component
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      children,
      content,
      position = "top",
      color,
      open = false,
      className,
      contentClassName,
    },
    ref
  ) => {
    const positionClass = position ? `tooltip-${position}` : "";
    const colorClass = color ? `tooltip-${color}` : "";
    const openClass = open ? "tooltip-open" : "";

    return (
      <div
        ref={ref}
        className={cn(
          "tooltip",
          positionClass,
          colorClass,
          openClass,
          className
        )}
        data-tip={typeof content === "string" ? content : undefined}
      >
        {typeof content !== "string" && (
          <div className="tooltip-content">
            <div className={cn(contentClassName)}>{content}</div>
          </div>
        )}
        {children}
      </div>
    );
  }
);

Tooltip.displayName = "Tooltip";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
