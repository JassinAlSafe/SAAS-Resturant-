"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingListItem } from "@/lib/types";
import { Modal, ModalSection, ModalFooter } from "@/components/ui/modal/modal";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TagIcon,
  DollarSign,
  FileText,
  AlertTriangle,
  ShoppingBag,
  Scale,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name is too long"),
  quantity: z.coerce
    .number()
    .min(0.01, "Quantity must be greater than 0")
    .max(1000000, "Quantity is too large"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().optional(),
  estimatedCost: z.coerce
    .number()
    .min(0, "Cost must be 0 or greater")
    .max(1000000, "Cost is too large"),
  notes: z.string().optional(),
  isUrgent: z.boolean().default(false),
  custom_unit: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Save recent categories to local storage
const RECENTLY_USED_KEY = "recentlyUsedCategories";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Partial<ShoppingListItem>) => Promise<void>;
  categories: string[];
  isAddingItem: boolean;
  initialData?: ShoppingListItem;
}

export default function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  categories,
  isAddingItem,
  initialData,
}: AddItemModalProps) {
  const [useCustomUnit, setUseCustomUnit] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Unit options grouped by type
  const unitGroups = useMemo(
    () => ({
      weight: ["kg", "g", "lb", "oz"],
      volume: ["l", "ml", "gal", "qt", "tbsp", "tsp", "cup"],
      count: ["pieces", "boxes", "bags", "bottles", "cans", "packs", "dozen"],
    }),
    []
  );

  // Determine if we're in edit mode
  const isEditMode = !!initialData;

  // Initialize form with default values or initialData if provided
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
    mode: "onChange", // Validate on change for better user feedback
  });

  // Check if the initial unit is custom (not in standard units)
  useEffect(() => {
    if (initialData?.unit) {
      const allStandardUnits = [
        ...unitGroups.weight,
        ...unitGroups.volume,
        ...unitGroups.count,
      ];
      const isCustomUnit = !allStandardUnits.includes(initialData.unit);
      setUseCustomUnit(isCustomUnit);

      if (isCustomUnit) {
        form.setValue("custom_unit", initialData.unit);
      }
    }
  }, [initialData, form, unitGroups]);

  // Load recently used categories from localStorage
  useEffect(() => {
    if (!isOpen) return; // Only load when modal opens

    try {
      const saved = localStorage.getItem(RECENTLY_USED_KEY);
      if (saved) {
        setRecentlyUsed(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load recently used categories:", error);
      // Clear potentially corrupted data
      localStorage.removeItem(RECENTLY_USED_KEY);
    }
  }, [isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        quantity: 1,
        unit: "pieces",
        category: categories[0] || "",
        notes: "",
        estimatedCost: 0,
        isUrgent: false,
        custom_unit: "",
      });
      setFormError(null);
      setUseCustomUnit(false);
    }
  }, [isOpen, form, categories]);

  // Save a category to recently used
  const addToRecentlyUsed = (category: string) => {
    if (!category || !recentlyUsed.includes(category)) {
      const updated = category
        ? [category, ...recentlyUsed.filter((c) => c !== category).slice(0, 4)]
        : recentlyUsed;

      setRecentlyUsed(updated);
      try {
        localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recently used categories:", error);
      }
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setFormError(null);

      // If using custom unit, replace the unit with the custom value
      if (useCustomUnit && data.custom_unit) {
        data.unit = data.custom_unit;
      } else if (useCustomUnit && !data.custom_unit) {
        setFormError("Custom unit is required");
        return;
      }

      // Add to recently used categories
      if (data.category) {
        addToRecentlyUsed(data.category);
      }

      // Prepare the item data
      const itemData: Partial<ShoppingListItem> = {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category || "",
        estimatedCost: data.estimatedCost,
        notes: data.notes || "",
        isUrgent: data.isUrgent,
      };

      // If not in edit mode, add isPurchased and isAutoGenerated fields
      if (!initialData) {
        itemData.isPurchased = false;
        itemData.isAutoGenerated = false;
      }

      // Pass the data to the onAddItem handler (works for both adding and updating)
      await onAddItem(itemData);

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      setFormError(
        initialData
          ? "Failed to update item. Please try again."
          : "Failed to add item. Please try again."
      );
    }
  };

  // Function to get popular categories (most used)
  const popularCategories = useMemo(() => {
    return categories.slice(0, 5);
  }, [categories]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-full">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-2xl font-semibold">
            {isEditMode ? "Edit Shopping Item" : "Add Shopping Item"}
          </span>
        </div>
      }
      description={
        <span className="text-gray-600 ml-11 block">
          {isEditMode
            ? "Update the details of this item"
            : "Fill in the details to add a new item to your shopping list"}
        </span>
      }
      size="lg"
      showClose={false}
      className="overflow-hidden rounded-xl border-0 shadow-2xl max-w-2xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-7">
          {formError && (
            <Alert
              variant="destructive"
              className="mx-1 rounded-lg shadow-sm border border-red-200"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <ModalSection divider className="pt-1 pb-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Item Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter item name"
                      {...field}
                      autoFocus
                      aria-required="true"
                      className="h-11 text-base shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ModalSection>

          <ModalSection
            title={
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <span>Quantity & Unit</span>
              </div>
            }
            divider
            className="pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Quantity <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter quantity"
                        {...field}
                        aria-required="true"
                        className="h-11 text-base shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Unit <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex items-center space-x-3 mb-2 bg-gray-50 p-2 rounded-md">
                    <span className="text-sm text-gray-600 font-medium">
                      Standard
                    </span>
                    <Switch
                      checked={useCustomUnit}
                      onChange={(e) => {
                        setUseCustomUnit(e.target.checked);
                        // Reset custom unit value when switching back to standard
                        if (!e.target.checked) {
                          form.setValue("custom_unit", "");
                        }
                      }}
                      aria-label="Use custom unit"
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      Custom
                    </span>
                  </div>

                  {!useCustomUnit ? (
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              className="w-full h-11 text-base shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="" disabled>
                                Select unit
                              </option>
                              {Object.entries(unitGroups).map(
                                ([groupName, units]) => (
                                  <optgroup
                                    key={groupName}
                                    label={
                                      groupName.charAt(0).toUpperCase() +
                                      groupName.slice(1)
                                    }
                                  >
                                    {units.map((unit) => (
                                      <option key={unit} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </optgroup>
                                )
                              )}
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="custom_unit"
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <Input
                              placeholder="Enter custom unit"
                              {...field}
                              className="h-11 text-base shadow-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    />
                  )}
                </FormItem>
              </div>
            </div>
          </ModalSection>

          <ModalSection
            title={
              <div className="flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-blue-600" />
                <span>Details</span>
              </div>
            }
            divider
            className="pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Category
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-11 text-base shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {recentlyUsed.length > 0 && (
                          <optgroup label="Recently Used">
                            {recentlyUsed.map((category) => (
                              <option
                                key={`recent-${category}`}
                                value={category}
                              >
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
                      </Select>
                    </FormControl>
                    <FormMessage />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {popularCategories.map((category) => (
                        <Badge
                          key={category}
                          variant={
                            field.value === category ? "default" : "outline"
                          }
                          className={cn(
                            "cursor-pointer transition-colors py-1 px-2",
                            field.value === category
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                              : "hover:bg-gray-100 border-gray-200"
                          )}
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
                    <FormLabel className="text-gray-700 font-medium">
                      Estimated Cost
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          className="h-11 text-base shadow-sm pl-10 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-gray-500 text-sm mt-1.5">
                      Leave at 0 if unknown
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm mt-5 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        field.value ? "bg-amber-100" : "bg-gray-100"
                      )}
                    >
                      <Clock
                        className={cn(
                          "h-5 w-5",
                          field.value ? "text-amber-600" : "text-gray-400"
                        )}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium cursor-pointer">
                        Mark as Urgent
                      </FormLabel>
                      <FormDescription className="text-gray-600">
                        Prioritize this item in your shopping list
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      aria-label="Mark as urgent"
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </ModalSection>

          <ModalSection
            title={
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Additional Information</span>
              </div>
            }
            className="pb-6"
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about the item..."
                      className="min-h-[120px] resize-y text-base shadow-sm focus:ring-2 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ModalSection>

          <ModalFooter
            onClose={onClose}
            closeLabel="Cancel"
            confirmLabel={isEditMode ? "Update Item" : "Add Item"}
            onConfirm={form.handleSubmit(handleSubmit)}
            isSubmitting={isAddingItem}
            confirmVariant="default"
            fullWidth
          />
        </form>
      </Form>
    </Modal>
  );
}
