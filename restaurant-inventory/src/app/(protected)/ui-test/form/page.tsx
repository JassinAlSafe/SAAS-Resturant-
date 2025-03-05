"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiSave, FiAlertCircle } from "react-icons/fi";

// Define form schema
const formSchema = z.object({
  itemName: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  quantity: z.coerce.number().positive({
    message: "Quantity must be a positive number.",
  }),
  unit: z.string().min(1, {
    message: "Unit is required.",
  }),
  notes: z.string().optional(),
  isUrgent: z.boolean().default(false),
});

export default function FormTestPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(
    null
  );

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      category: "",
      quantity: 1,
      unit: "",
      notes: "",
      isUrgent: false,
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormData(values);
    setFormSubmitted(true);
    console.log(values);
  }

  // Categories for select
  const categories = [
    "Meat",
    "Dairy",
    "Produce",
    "Bakery",
    "Seafood",
    "Pantry",
    "Cleaning",
    "Other",
  ];

  // Units for select
  const units = ["kg", "g", "L", "ml", "pcs", "box", "bottle", "can", "pack"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Form Components Test
      </h1>

      <div className="space-y-8">
        {/* Basic Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Inventory Item</CardTitle>
            <CardDescription>
              Fill out the form to add a new item to your inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Item Name */}
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of the item to add to inventory.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The category this item belongs to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter quantity"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The amount of this item.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Unit */}
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The unit of measurement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes here"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes about this item.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Urgent */}
                <FormField
                  control={form.control}
                  name="isUrgent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <CustomCheckbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Mark as Urgent</FormLabel>
                        <FormDescription>
                          This item will be highlighted in the inventory list.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  <FiSave className="mr-2 h-4 w-4" />
                  Save Item
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Form Submission Result */}
        {formSubmitted && formData && (
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-green-600 h-5 w-5" />
                <CardTitle className="text-green-800">
                  Form Submission Result
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500">Item Name</h3>
                  <p className="text-gray-900">{formData.itemName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Category</h3>
                  <p className="text-gray-900">{formData.category}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Quantity</h3>
                  <p className="text-gray-900">
                    {formData.quantity} {formData.unit}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Urgent</h3>
                  <p className="text-gray-900">
                    {formData.isUrgent ? "Yes" : "No"}
                  </p>
                </div>
                {formData.notes && (
                  <div className="col-span-2">
                    <h3 className="font-medium text-gray-500">Notes</h3>
                    <p className="text-gray-900">{formData.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  form.reset();
                  setFormSubmitted(false);
                  setFormData(null);
                }}
                className="ml-auto"
              >
                Reset Form
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
