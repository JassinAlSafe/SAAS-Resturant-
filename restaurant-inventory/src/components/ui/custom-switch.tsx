"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomSwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "default" | "sm";
}

export const CustomSwitch = React.forwardRef<
  HTMLButtonElement,
  CustomSwitchProps
>(
  (
    {
      className,
      checked,
      onCheckedChange,
      label,
      description,
      disabled = false,
      isLoading = false,
      size = "default",
      ...props
    },
    ref
  ) => {
    const id = React.useId();

    const handleClick = () => {
      if (!disabled && !isLoading) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!disabled && !isLoading) {
          onCheckedChange(!checked);
        }
      }
    };

    const isSmall = size === "sm";

    return (
      <div className="flex flex-col">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled || isLoading}
          data-state={checked ? "checked" : "unchecked"}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          ref={ref}
          tabIndex={disabled || isLoading ? -1 : 0}
          {...props}
          className={cn(
            "relative w-full border rounded-xl transition-colors duration-300 bg-white",
            isSmall ? "p-3" : "p-5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "hover:border-blue-200 hover:shadow-sm",
            checked && !disabled && "border-blue-200 bg-blue-50/30",
            className
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <h3
                className={cn(
                  "font-semibold text-gray-900",
                  isSmall ? "text-base" : "text-lg"
                )}
              >
                {label || "Preferred Supplier"}
              </h3>
              <p
                className={cn("text-gray-500", isSmall ? "text-xs" : "text-sm")}
              >
                {description || "Mark as a preferred supplier"}
              </p>
            </div>

            {isLoading ? (
              <div
                className={cn(
                  "rounded-full animate-spin border-4 border-gray-200 border-t-gray-400",
                  isSmall ? "h-7 w-7" : "h-10 w-10"
                )}
                aria-hidden="true"
              />
            ) : (
              <div
                className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-300",
                  checked ? "bg-green-500" : "bg-gray-200",
                  isSmall ? "h-7 w-7" : "h-10 w-10",
                  !disabled && checked && "hover:bg-green-600 shadow-sm",
                  !disabled && !checked && "hover:bg-gray-300"
                )}
                aria-hidden="true"
              >
                {checked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(
                      "text-white",
                      isSmall ? "h-4 w-4" : "h-6 w-6"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
          <span className="sr-only">
            {checked ? "Preferred" : "Not preferred"}
          </span>
        </button>
      </div>
    );
  }
);

CustomSwitch.displayName = "CustomSwitch";
