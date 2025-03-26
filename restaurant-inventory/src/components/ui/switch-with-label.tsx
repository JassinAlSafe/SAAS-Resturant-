"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SwitchWithLabelProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function SwitchWithLabel({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  className,
  disabled = false,
}: SwitchWithLabelProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        color="primary"
      />
      <div className="grid gap-1.5 leading-none">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}
