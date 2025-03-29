"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The orientation of the scroll area
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both";
  /**
   * Maximum height of the scroll area
   */
  maxHeight?: string;
}

/**
 * ScrollArea component styled with DaisyUI/Tailwind classes
 * Provides a scrollable area with customizable styles
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      children,
      orientation = "vertical",
      maxHeight = "h-[400px]",
      ...props
    },
    ref
  ) => {
    // Determine appropriate overflow classes based on orientation
    const overflowClasses = {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden",
      both: "overflow-auto",
    }[orientation];

    return (
      <div
        ref={ref}
        className={cn(
          // Base styling
          "relative rounded-md",
          maxHeight,
          overflowClasses,
          // DaisyUI color theming
          "bg-base-100 border border-base-200",
          className
        )}
        style={{
          // Custom scrollbar styling that works cross-browser
          scrollbarWidth: "thin",
          scrollbarColor:
            "var(--fallback-bc, oklch(var(--bc)/0.3)) transparent",
        }}
        {...props}
      >
        <div className="h-full w-full">{children}</div>
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
