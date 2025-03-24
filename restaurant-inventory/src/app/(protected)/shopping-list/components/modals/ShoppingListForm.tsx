"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingListItem } from "@/lib/types";
import {
  Loader2,
  Save,
  X,
  PlusCircle,
  TagIcon,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  estimatedCost: z.coerce.number().min(0, "Cost must be 0 or greater"),
  isUrgent: z.boolean().default(false),
  custom_unit: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ShoppingListFormProps {
  initialData?: ShoppingListItem | null;
  onSubmit: (data: FormData) => Promise<void>;
  categories: string[];
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ShoppingListForm({
  initialData,
  onSubmit,
  categories,
  isSubmitting,
  onCancel,
}: ShoppingListFormProps) {
  const [useCustomUnit, setUseCustomUnit] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  // Group units by types for better organization
  const unitGroups = {
    weight: ["kg", "g", "lb", "oz"],
    volume: ["l", "ml", "cup", "tbsp", "tsp", "gal"],
    count: ["pieces", "boxes", "bags", "bottles", "cans", "packs"],
  };

  // Flatten for default value access
  const allUnits = Object.values(unitGroups).flat();

  // Check if the initial data has a unit that's not in our predefined lists
  useEffect(() => {
    if (initialData?.unit && !allUnits.includes(initialData.unit)) {
      setUseCustomUnit(true);
    }
  }, [initialData, allUnits]);

  // Load recently used items from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentlyUsedCategories");
      if (saved) {
        setRecentlyUsed(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load recently used categories:", error);
    }
  }, []);

  // Save a category to recently used
  const addToRecentlyUsed = (category: string) => {
    if (!recentlyUsed.includes(category)) {
      const updated = [category, ...recentlyUsed.slice(0, 4)];
      setRecentlyUsed(updated);
      try {
        localStorage.setItem("recentlyUsedCategories", JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recently used categories:", error);
      }
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      quantity: initialData?.quantity || 1,
      unit: initialData?.unit || "pieces",
      category: initialData?.category || categories[0] || "",
      notes: initialData?.notes || "",
      estimatedCost: initialData?.estimatedCost || 0,
      isUrgent: initialData?.isUrgent || false,
      custom_unit: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        quantity: initialData.quantity,
        unit: useCustomUnit ? "custom" : initialData.unit,
        category: initialData.category,
        notes: initialData.notes || "",
        estimatedCost: initialData.estimatedCost,
        isUrgent: initialData.isUrgent || false,
        custom_unit: useCustomUnit ? initialData.unit : "",
      });
    }
  }, [initialData, form, useCustomUnit]);

  const handleSubmit = async (data: FormData) => {
    try {
      // If using custom unit, replace the unit with the custom value
      if (useCustomUnit && data.custom_unit) {
        data.unit = data.custom_unit;
      }

      // Add to recently used categories
      if (data.category) {
        addToRecentlyUsed(data.category);
      }

      await onSubmit(data);
      form.reset();
      onCancel();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          {initialData ? "Edit Item" : "Add New Item"}
        </CardTitle>
        <CardDescription>
          {initialData
            ? "Update the details of your shopping list item"
            : "Fill in the details to add an item to your shopping list"}
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4 pb-0">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Name <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter item name"
                      {...field}
                      autoFocus
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Quantity <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter quantity"
                        {...field}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Unit <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-muted-foreground">
                          Standard
                        </span>
                        <Switch
                          checked={useCustomUnit}
                          onCheckedChange={setUseCustomUnit}
                          aria-label="Use custom unit"
                        />
                        <span className="text-sm text-muted-foreground">
                          Custom
                        </span>
                      </div>
                      {!useCustomUnit ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(unitGroups).map(
                              ([groupName, units]) => (
                                <SelectGroup key={groupName}>
                                  <SelectLabel>
                                    {groupName.charAt(0).toUpperCase() +
                                      groupName.slice(1)}
                                  </SelectLabel>
                                  {units.map((unit) => (
                                    <SelectItem key={unit} value={unit}>
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormField
                          control={form.control}
                          name="custom_unit"
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                placeholder="Enter custom unit"
                                {...field}
                              />
                            </FormControl>
                          )}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1.5" />
                      Category <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recentlyUsed.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Recently Used</SelectLabel>
                            {recentlyUsed.map((category) => (
                              <SelectItem
                                key={`recent-${category}`}
                                value={category}
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                        <SelectGroup>
                          <SelectLabel>All Categories</SelectLabel>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {categories.slice(0, 5).map((category) => (
                        <Badge
                          key={category}
                          variant={
                            field.value === category ? "default" : "outline"
                          }
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => form.setValue("category", category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1.5" />
                      Estimated Cost
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter estimated cost"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Leave at 0 if unknown</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Mark as Urgent</FormLabel>
                    <FormDescription>
                      Prioritize this item in your shopping list
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="h-4 w-4 mr-1.5" />
                    Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about the item..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between pt-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Discard changes and close form</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button type="submit" disabled={isSubmitting} className="gap-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                <>
                  <Save className="h-4 w-4" />
                  Update
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
