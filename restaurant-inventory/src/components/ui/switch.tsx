"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Omit the 'size' property from the original InputHTMLAttributes
// to avoid conflicts with our custom size property
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "error";
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, size = "md", color = "primary", ...props }, ref) => {
    // Build the class names based on the size and color props
    const toggleClasses = cn(
      "toggle",
      // Size variants
      size && `toggle-${size}`,
      // Color variants
      color && `toggle-${color}`,
      className
    );

    return (
      <input
        type="checkbox"
        className={toggleClasses}
        ref={ref}
        {...props}
      />
    );
  }
);

Switch.displayName = "Switch";

export { Switch }
