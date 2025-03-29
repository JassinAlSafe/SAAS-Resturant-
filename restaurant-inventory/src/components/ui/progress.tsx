"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
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
  /**
   * Class name for the indicator element
   */
  indicatorClassName?: string;
}

/**
 * Progress component using DaisyUI styling with custom indicator
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, value = 0, variant, max = 100, indicatorClassName, ...props },
    ref
  ) => {
    const percentage = (Math.min(Math.max(0, value), max) / max) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          "relative w-full overflow-hidden rounded bg-gray-200",
          variant && `bg-${variant}-100`,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all",
            variant ? `bg-${variant}-500` : "bg-primary",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
