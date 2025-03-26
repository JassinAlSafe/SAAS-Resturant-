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

export { Tooltip };
