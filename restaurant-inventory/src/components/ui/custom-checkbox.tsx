"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  variant?: "default" | "purchased";
}

const CustomCheckbox = React.forwardRef<HTMLDivElement, CustomCheckboxProps>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      disabled = false,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const isPurchased = variant === "purchased";

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          isPurchased || checked
            ? "text-white"
            : "text-transparent",
          !disabled && !isPurchased && "cursor-pointer",
          disabled && "opacity-50",
          className
        )}
        onClick={() => {
          if (!disabled && !isPurchased && onCheckedChange) {
            onCheckedChange(!checked);
          }
        }}
        {...props}
      >
        <input 
          type="checkbox" 
          checked={checked || isPurchased}
          onChange={() => {}}
          disabled={disabled || isPurchased}
          className={cn(
            "checkbox checkbox-sm",
            checked || isPurchased ? "checkbox-primary" : ""
          )}
        />
      </div>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";

export { CustomCheckbox };
