"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, description, id, ...props }, ref) => {
  // Generate a unique ID for accessibility if not provided
  const uniqueId = React.useId();
  const switchId = id || uniqueId;

  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitives.Root
        id={switchId}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200",
          className
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitives.Root>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-gray-500 mt-0.5">{description}</span>
          )}
        </div>
      )}
    </div>
  );
});

Switch.displayName = "Switch";

export { Switch };
