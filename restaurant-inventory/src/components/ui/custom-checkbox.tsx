"use client";

import * as React from "react";
import { FiCheck } from "react-icons/fi";
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
          "h-5 w-5 rounded-md flex items-center justify-center",
          isPurchased || checked
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600",
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
        {(isPurchased || checked) && <FiCheck className="h-3 w-3" />}
      </div>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";

export { CustomCheckbox };
