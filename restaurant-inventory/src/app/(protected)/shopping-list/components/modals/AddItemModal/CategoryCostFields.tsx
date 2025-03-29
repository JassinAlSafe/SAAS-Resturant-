"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, UseFormSetValue } from "react-hook-form";
import { FormData } from "../AddItemModal/types";
import { TagIcon, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCostFieldsProps {
  control: Control<FormData>;
  setValue: UseFormSetValue<FormData>;
  categories: string[];
  recentlyUsed: string[];
  popularCategories: string[];
}

export default function CategoryCostFields({
  control,
  setValue,
  categories,
  recentlyUsed,
  popularCategories,
}: CategoryCostFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <TagIcon className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label">
                <span className="label-text font-medium">Category</span>
              </FormLabel>
              <FormControl>
                <select
                  value={field.value}
                  onChange={field.onChange}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {recentlyUsed.length > 0 && (
                    <optgroup label="Recently Used">
                      {recentlyUsed.map((category) => (
                        <option key={`recent-${category}`} value={category}>
                          {category}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All Categories">
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </FormControl>
              <FormMessage />
              <div className="flex flex-wrap gap-2 mt-3">
                {popularCategories.map((category) => (
                  <div
                    key={category}
                    className={cn(
                      "badge py-3 px-3 cursor-pointer",
                      field.value === category
                        ? "badge-primary"
                        : "badge-outline hover:bg-base-200"
                    )}
                    onClick={() => setValue("category", category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="estimatedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label">
                <span className="label-text font-medium">Estimated Cost</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs mt-1.5">
                Leave at 0 if unknown
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
