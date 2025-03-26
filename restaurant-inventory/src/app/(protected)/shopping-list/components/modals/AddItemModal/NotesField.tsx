"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { FormData } from "../AddItemModal/types";
import { FileText } from "lucide-react";

interface NotesFieldProps {
  control: Control<FormData>;
}

export default function NotesField({ control }: NotesFieldProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Additional Information</h3>
      </div>

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="label">
              <span className="label-text font-medium">Notes</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any notes about the item..."
                className="textarea textarea-bordered min-h-[120px] resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
