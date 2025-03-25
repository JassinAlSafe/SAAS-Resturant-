"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface HoverCardProps {
  children: React.ReactNode;
}

export interface HoverCardTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface HoverCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  align?: "start" | "center" | "end" | "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  width?: string;
}

/**
 * HoverCard component that uses DaisyUI tooltip
 * Provides similar functionality to Radix UI's HoverCard
 */
const HoverCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & HoverCardProps
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative group", className)} {...props}>
      {children}
    </div>
  );
});

HoverCard.displayName = "HoverCard";

const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & HoverCardTriggerProps
>(({ className, children, asChild = false, ...props }, ref) => {
  if (asChild) {
    // If asChild is true, we just wrap the children in a span with hover functionality
    return (
      <span ref={ref} className={cn("cursor-pointer", className)} {...props}>
        {children}
      </span>
    );
  }

  return (
    <div ref={ref} className={cn("cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
});

HoverCardTrigger.displayName = "HoverCardTrigger";

const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  HoverCardContentProps
>(
  (
    {
      className,
      align = "bottom",
      sideOffset = 8,
      width = "w-64",
      children,
      ...props
    },
    ref
  ) => {
    // Get DaisyUI tooltip position classes
    const getPositionClass = () => {
      switch (align) {
        case "top":
          return `bottom-full mb-${sideOffset / 2}`;
        case "bottom":
          return `top-full mt-${sideOffset / 2}`;
        case "left":
        case "start":
          return `right-full mr-${sideOffset / 2}`;
        case "right":
        case "end":
          return `left-full ml-${sideOffset / 2}`;
        default:
          return `top-full mt-${sideOffset / 2}`;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "absolute z-50 rounded-md border bg-white p-4 shadow-lg",
          // Positioning
          getPositionClass(),
          width,
          // Animation
          "invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
