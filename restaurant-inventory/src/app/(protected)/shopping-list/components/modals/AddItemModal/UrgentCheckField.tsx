"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { FormData } from "../AddItemModal/types";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrgentCheckFieldProps {
  control: Control<FormData>;
}

export default function UrgentCheckField({ control }: UrgentCheckFieldProps) {
  return (
    <FormField
      control={control}
      name="isUrgent"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-base-200">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-full",
                field.value ? "bg-warning/20" : "bg-base-300"
              )}
            >
              <Clock
                className={cn(
                  "h-5 w-5",
                  field.value ? "text-warning" : "text-base-content/50"
                )}
              />
            </div>
            <div className="space-y-0.5">
              <FormLabel className="text-base font-medium cursor-pointer">
                Mark as Urgent
              </FormLabel>
              <FormDescription className="text-xs">
                Prioritize this item in your shopping list
              </FormDescription>
            </div>
          </div>
          <FormControl>
            <input
              type="checkbox"
              className="toggle toggle-warning"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
