"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Supplier, SupplierCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { Badge } from "@/components/ui/badge";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTag,
  FiImage,
} from "react-icons/fi";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const phoneRegex = /^(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  categories: z
    .array(z.nativeEnum(SupplierCategory))
    .min(1, "Select at least one category"),
  isPreferred: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  logo: z.string().optional(),
  rating: z.number().default(0),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: SupplierFormValues) => void;
  onCancel: () => void;
}

// Define category colors for badges
const categoryColors: Record<SupplierCategory, string> = {
  [SupplierCategory.MEAT]: "bg-red-100 text-red-800 border-red-200",
  [SupplierCategory.DAIRY]: "bg-blue-100 text-blue-800 border-blue-200",
  [SupplierCategory.VEGETABLES]: "bg-green-100 text-green-800 border-green-200",
  [SupplierCategory.FRUITS]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [SupplierCategory.BEVERAGES]:
    "bg-purple-100 text-purple-800 border-purple-200",
  [SupplierCategory.BAKERY]: "bg-amber-100 text-amber-800 border-amber-200",
  [SupplierCategory.SEAFOOD]: "bg-cyan-100 text-cyan-800 border-cyan-200",
  [SupplierCategory.DRY_GOODS]:
    "bg-orange-100 text-orange-800 border-orange-200",
  [SupplierCategory.OTHER]: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      contactName: supplier?.contactName ?? "",
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
      address: supplier?.address ?? "",
      categories: supplier?.categories ?? [],
      isPreferred: supplier?.isPreferred ?? false,
      status: supplier?.status ?? "ACTIVE",
      logo: supplier?.logo ?? "",
      rating: supplier?.rating ?? 0,
    },
  });

  const handleSubmit = (data: SupplierFormValues) => {
    onSubmit(data);
  };

  const isEditing = !!supplier;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <p className="text-sm text-gray-500">
            Enter the core details about the supplier
          </p>
          <Separator className="my-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <span>Name</span> <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter supplier name"
                      className="pl-9 bg-gray-50"
                      {...field}
                    />
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Name Field */}
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Contact Person
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter contact person name"
                      className="pl-9 bg-gray-50"
                      {...field}
                    />
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      list="email-suggestions"
                      className="pl-9 bg-gray-50"
                      {...field}
                    />
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </FormControl>
                <datalist id="email-suggestions">
                  <option value="@gmail.com" />
                  <option value="@yahoo.com" />
                  <option value="@outlook.com" />
                  <option value="@hotmail.com" />
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">Phone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="(123) 456-7890"
                      className="pl-9 bg-gray-50"
                      {...field}
                      onChange={(e) => {
                        // Auto-format phone number
                        let value = e.target.value.replace(/\\D/g, "");
                        if (value.length <= 10) {
                          if (value.length > 6) {
                            value = `(${value.slice(0, 3)}) ${value.slice(
                              3,
                              6
                            )}-${value.slice(6)}`;
                          } else if (value.length > 3) {
                            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                          } else if (value.length > 0) {
                            value = `(${value}`;
                          }
                        }
                        field.onChange(value);
                      }}
                    />
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <span>Address</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Enter complete address"
                    className="resize-none pl-9 pt-3 bg-gray-50 min-h-[80px]"
                    {...field}
                  />
                  <FiMapPin className="absolute left-3 top-7 text-gray-400" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1 pt-2">
          <h3 className="text-lg font-medium">Categories & Settings</h3>
          <p className="text-sm text-gray-500">
            Configure supplier categories and additional settings
          </p>
          <Separator className="my-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Categories Field */}
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem className="lg:col-span-2">
                <FormLabel className="flex items-center gap-2">
                  <span>Categories</span>{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <div className="space-y-3">
                  <div className="relative">
                    <Select
                      onValueChange={(value) => {
                        const category = value as SupplierCategory;
                        if (!field.value.includes(category)) {
                          field.onChange([...field.value, category]);
                        }
                      }}
                    >
                      <SelectTrigger className="pl-9 bg-gray-50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SupplierCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  </div>
                  <div
                    className={cn(
                      "flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md border-dashed border-gray-300",
                      field.value.length > 0 ? "bg-gray-50" : "bg-gray-50/50"
                    )}
                  >
                    {field.value.length === 0 && (
                      <p className="text-sm text-gray-400">
                        No categories selected
                      </p>
                    )}
                    {field.value.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className={`flex items-center gap-1 ${categoryColors[category]} transition-all hover:shadow-xs`}
                      >
                        {category.replace("_", " ")}
                        <button
                          type="button"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((c) => c !== category)
                            )
                          }
                          className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-black/5"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Status Field */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-green-600">
                      Active
                    </SelectItem>
                    <SelectItem value="INACTIVE" className="text-red-600">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Logo URL Field */}
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Logo URL
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter logo URL"
                    type="url"
                    className="pl-9 bg-gray-50"
                    {...field}
                  />
                  <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Supplier Field */}
        <FormField
          control={form.control}
          name="isPreferred"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormControl>
                <CustomSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Preferred Supplier"
                  description="Mark as a preferred supplier"
                  isLoading={form.formState.isSubmitting}
                  size="sm"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-8 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Supplier"
              : "Create Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
