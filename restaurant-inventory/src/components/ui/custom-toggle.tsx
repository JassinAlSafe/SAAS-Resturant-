"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  disabled?: boolean;
  label?: string;
  description?: string;
}

const CustomToggle = React.forwardRef<HTMLButtonElement, CustomToggleProps>(
  (
    {
      checked = false,
      onCheckedChange,
      size = "md",
      color = "primary",
      disabled = false,
      label,
      description,
      className,
      ...props
    },
    ref
  ) => {
    // Size variations
    const sizes = {
      sm: {
        toggle: "h-5 w-9",
        circle: "h-4 w-4",
        translate: "translate-x-[18px]",
      },
      md: {
        toggle: "h-6 w-11",
        circle: "h-5 w-5",
        translate: "translate-x-[22px]",
      },
      lg: {
        toggle: "h-7 w-12",
        circle: "h-6 w-6",
        translate: "translate-x-[24px]",
      },
    };

    // Color variations
    const colors = {
      primary: {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
      },
      success: {
        bg: "bg-green-600",
        hover: "hover:bg-green-700",
      },
      warning: {
        bg: "bg-yellow-600",
        hover: "hover:bg-yellow-700",
      },
      danger: {
        bg: "bg-red-600",
        hover: "hover:bg-red-700",
      },
    };

    // Handle keyboard interaction
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onCheckedChange?.(!checked);
      }
    };

    return (
      <div className="inline-flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          data-state={checked ? "checked" : "unchecked"}
          disabled={disabled}
          ref={ref}
          onClick={() => onCheckedChange?.(!checked)}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative inline-flex items-center justify-start rounded-full transition-colors duration-200 ease-in-out",
            "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
            checked
              ? cn(colors[color].bg, colors[color].hover)
              : "bg-gray-200 dark:bg-gray-600",
            disabled && "cursor-not-allowed opacity-50",
            sizes[size].toggle,
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "absolute inset-y-0 my-auto left-[2px] rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out",
              checked ? sizes[size].translate : "translate-x-0",
              sizes[size].circle
            )}
          />
        </button>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span
                className={cn(
                  "text-sm font-medium leading-none text-gray-900 dark:text-gray-100",
                  disabled && "opacity-50"
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                className={cn(
                  "text-xs text-gray-500 dark:text-gray-400",
                  disabled && "opacity-50"
                )}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

CustomToggle.displayName = "CustomToggle";

export { CustomToggle };
