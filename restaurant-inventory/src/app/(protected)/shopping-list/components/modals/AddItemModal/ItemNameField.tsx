"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { FormData } from "../AddItemModal/types";

interface ItemNameFieldProps {
  control: Control<FormData>;
}

export default function ItemNameField({ control }: ItemNameFieldProps) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="label">
            <span className="label-text font-medium">
              Item Name <span className="text-error">*</span>
            </span>
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Enter item name"
              {...field}
              autoFocus
              aria-required="true"
              className="input input-bordered w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
