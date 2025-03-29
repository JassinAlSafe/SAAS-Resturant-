"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Whether to use the floating label style
   */
  floating?: boolean;
}

/**
 * DaisyUI Label component
 *
 * Can be used as a regular label or as a floating label.
 *
 * Regular label: <Label>Your label</Label>
 * Floating label: <Label floating>Your label</Label>
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, floating = false, children, ...props }, ref) => {
    // Determine the base classes based on the variant
    const baseClass = floating ? "floating-label" : "label";

    return (
      <label ref={ref} className={cn(baseClass, className)} {...props}>
        {children}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label };
