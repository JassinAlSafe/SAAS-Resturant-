"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  variant?:
    | "ghost"
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * DaisyUI Select component
 * Simple wrapper around the HTML select element with DaisyUI styling
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, variant, size, ...props }, ref) => {
    // Build the class names based on the variant and size
    const selectClasses = cn(
      "select w-full",
      // Variants
      variant && `select-${variant}`,
      // Sizes
      size && `select-${size}`,
      // Custom class names
      className
    );

    return (
      <select className={selectClasses} ref={ref} {...props}>
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
