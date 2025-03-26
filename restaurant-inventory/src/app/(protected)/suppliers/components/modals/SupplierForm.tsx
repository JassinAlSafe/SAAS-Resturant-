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
import { Select } from "@/components/ui/select";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { Badge } from "@/components/ui/badge";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiImage,
} from "react-icons/fi";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  rating: z.number().min(0).max(5).default(0),
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

export function SupplierForm({
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
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-1 mb-4">
          <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
          <p className="text-sm text-gray-500">
            Enter the core details about the supplier
          </p>
          <Separator className="my-2 bg-orange-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700">
                  <span>Name</span> <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter supplier name"
                      className={cn(
                        "pl-9 input input-bordered focus:border-orange-400 focus:ring-orange-400",
                        form.formState.errors.name && "input-error"
                      )}
                      {...field}
                    />
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Contact Name Field */}
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700">
                  Contact Person
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter contact person name"
                      className="pl-9 input input-bordered focus:border-orange-400 focus:ring-orange-400"
                      {...field}
                    />
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      list="email-suggestions"
                      className={cn(
                        "pl-9 input input-bordered focus:border-orange-400 focus:ring-orange-400",
                        form.formState.errors.email && "input-error"
                      )}
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
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700">Phone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="(123) 456-7890"
                      className={cn(
                        "pl-9 input input-bordered focus:border-orange-400 focus:ring-orange-400",
                        form.formState.errors.phone && "input-error"
                      )}
                      {...field}
                      onChange={(e) => {
                        // Auto-format phone number
                        let value = e.target.value.replace(/\D/g, "");
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
                <FormMessage className="text-red-500" />
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
              <FormLabel className="flex items-center gap-2 text-gray-700">
                <span>Address</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Enter complete address"
                    className="resize-none pl-9 pt-3 input input-bordered focus:border-orange-400 focus:ring-orange-400 min-h-[80px]"
                    {...field}
                  />
                  <FiMapPin className="absolute left-3 top-7 text-gray-400" />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="space-y-1 pt-2">
          <h3 className="text-lg font-medium text-gray-800">Categories & Settings</h3>
          <p className="text-sm text-gray-500">
            Configure supplier categories and additional settings
          </p>
          <Separator className="my-2 bg-orange-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Categories Field */}
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem className="lg:col-span-2">
                <FormLabel className="flex items-center gap-2 text-gray-700">
                  Categories
                  <span className="text-red-500">*</span>
                </FormLabel>
                <div className="space-y-3">
                  <Select
                    value={field.value.length > 0 ? field.value[0] : ""}
                    onChange={(e) => {
                      const category = e.target.value as SupplierCategory;
                      if (category && !field.value.includes(category)) {
                        field.onChange([...field.value, category]);
                      }
                    }}
                    className="input input-bordered focus:border-orange-400 focus:ring-orange-400 w-full"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {Object.values(SupplierCategory).map((category) => (
                      <option key={category} value={category}>
                        {category.replace("_", " ")}
                      </option>
                    ))}
                  </Select>
                  <div
                    className={cn(
                      "flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md border-dashed",
                      field.value.length > 0
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-300 bg-gray-50/50",
                      form.formState.errors.categories && "border-red-300 bg-red-50"
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
                        className={`flex items-center gap-1 ${categoryColors[category]} transition-all hover:shadow-md`}
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
                  <FormMessage className="text-red-500" />
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
                <FormLabel className="text-gray-700">Status</FormLabel>
                <Select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="input input-bordered focus:border-orange-400 focus:ring-orange-400"
                >
                  <option value="ACTIVE" className="text-green-600">
                    Active
                  </option>
                  <option value="INACTIVE" className="text-red-600">
                    Inactive
                  </option>
                </Select>
                <FormMessage className="text-red-500" />
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
              <FormLabel className="flex items-center gap-2 text-gray-700">
                Logo URL
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter logo URL"
                    type="url"
                    className="pl-9 input input-bordered focus:border-orange-400 focus:ring-orange-400"
                    {...field}
                  />
                  <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
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
                  activeColor="bg-orange-500"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Rating Field */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel className="flex items-center gap-2 text-gray-700">
                Rating (0-5)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="1"
                    value={field.value}
                    onChange={(e) => {
                      // Convert to number and validate range
                      const value = e.target.value === '' ? 0 : Number(e.target.value);
                      field.onChange(isNaN(value) ? 0 : Math.max(0, Math.min(5, value)));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="input input-bordered focus:border-orange-400 focus:ring-orange-400 w-full"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="btn btn-outline border-gray-300 hover:bg-gray-100 hover:border-gray-300 px-8 py-2"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn bg-orange-500 hover:bg-orange-600 text-white border-none px-8 py-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Processing...</span>
              </div>
            ) : (
              <span>{isEditing ? "Update" : "Create"} Supplier</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
