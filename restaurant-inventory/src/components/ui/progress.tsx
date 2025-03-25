"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLProgressElement> {
  /**
   * The value of the progress bar (between 0 and 100)
   */
  value?: number;
  /**
   * The color variant of the progress bar
   */
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  /**
   * The maximum value of the progress (defaults to 100)
   */
  max?: number;
}

/**
 * Progress component using DaisyUI styling
 */
const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, value, variant, max = 100, ...props }, ref) => {
    return (
      <progress
        ref={ref}
        className={cn(
          "progress",
          // Add variant if provided
          variant && `progress-${variant}`,
          className
        )}
        value={value}
        max={max}
        {...props}
      />
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
