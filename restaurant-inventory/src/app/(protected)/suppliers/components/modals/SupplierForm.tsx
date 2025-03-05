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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FiX } from "react-icons/fi";

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
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: SupplierFormValues) => void;
  onCancel: () => void;
}

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
    },
  });

  const handleSubmit = (data: SupplierFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
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
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    list="email-suggestions"
                    {...field}
                  />
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(123) 456-7890"
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter complete address"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categories Field */}
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Categories <span className="text-red-500">*</span>
              </FormLabel>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    const category = value as SupplierCategory;
                    if (!field.value.includes(category)) {
                      field.onChange([...field.value, category]);
                    }
                  }}
                >
                  <SelectTrigger>
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
                <div className="flex flex-wrap gap-2">
                  {field.value.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {category.replace("_", " ")}
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value.filter((c) => c !== category)
                          )
                        }
                        className="text-muted-foreground hover:text-foreground"
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

        {/* Status and Preferred Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPreferred"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Preferred Supplier</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Mark as a preferred supplier
                  </div>
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
        </div>

        {/* Logo URL Field */}
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter logo URL" type="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {supplier ? "Update" : "Create"} Supplier
          </Button>
        </div>
      </form>
    </Form>
  );
}
