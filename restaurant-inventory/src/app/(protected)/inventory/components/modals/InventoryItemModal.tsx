"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem, Supplier } from "@/lib/types";
import { COMMON_CATEGORIES } from "@/lib/constants";
import {
  FiImage,
  FiZap,
  FiMinimize2,
  FiMaximize2,
  FiDollarSign,
  FiPackage,
  FiInfo,
  FiMapPin,
  FiTruck,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

// Interface for form data that includes both snake_case and camelCase properties
interface InventoryFormData
  extends Omit<
    InventoryItem,
    "id" | "created_at" | "updated_at" | "cost_per_unit" | "business_profile_id"
  > {
  expiryDate?: string;
  image_url?: string;
}

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: InventoryFormData) => void;
  onUpdate?: (itemData: InventoryFormData) => void;
  item?: InventoryItem;
  customCategories?: string[];
  suppliers?: Supplier[];
  userRole?: "admin" | "manager" | "staff";
}

export default function InventoryItemModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  item,
  customCategories = [],
  suppliers = [],
  userRole = "staff",
}: InventoryItemModalProps) {
  // Memoize the initial form data to avoid recalculation on every render
  const initialFormData = useMemo(() => {
    return {
      name: item?.name || "",
      description: item?.description || "",
      category: item?.category || "",
      quantity: item?.quantity || 0,
      unit: item?.unit || "units",
      cost: item?.cost || 0,
      reorder_level: item?.reorder_level || 0,
      max_stock: item?.max_stock || 0,
      supplier_id: item?.supplier_id || "",
      location: item?.location || "",
      expiry_date: item?.expiry_date || "",
      image_url: item?.image_url || "",
    };
  }, [item]);

  const [formData, setFormData] = useState<InventoryFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { formatCurrency } = useCurrency();

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialFormData]);

  // Common units for inventory items
  const commonUnits = [
    "units",
    "kg",
    "g",
    "lb",
    "oz",
    "l",
    "ml",
    "gal",
    "qt",
    "pt",
    "fl oz",
    "ea",
    "box",
    "case",
    "pack",
    "bottle",
    "jar",
    "can",
    "bag",
    "dozen",
  ];

  // Combine custom categories with common categories
  const allCategories = useMemo(() => {
    const uniqueCategories = new Set([
      ...customCategories,
      ...COMMON_CATEGORIES,
    ]);
    return Array.from(uniqueCategories);
  }, [customCategories]);

  // Handle form input changes
  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { name: string; value: string | number }
    ) => {
      // Handle both event objects and direct value objects
      const { name, value } = "target" in e ? e.target : e;
      
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Clear error for this field if it exists
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Handle number input changes
  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = parseFloat(value);
      handleChange({
        name,
        value: isNaN(numValue) ? 0 : numValue,
      });
    },
    [handleChange]
  );

  // Toggle between quick and full mode
  const toggleMode = useCallback(() => {
    setQuickMode((prev) => !prev);
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    
    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }
    
    if (formData.cost < 0) {
      newErrors.cost = "Cost cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        if (item && onUpdate) {
          await onUpdate(formData);
        } else {
          await onSave(formData);
        }
        onClose();
      } catch (error) {
        console.error("Error saving inventory item:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, item, onClose, onSave, onUpdate, validateForm]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white border border-gray-200 shadow-lg rounded-lg">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
              {item ? (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center"
                >
                  <span className="mr-2">Edit</span>
                  <span className="text-orange-600">{item.name}</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Add Inventory Item
                </motion.div>
              )}
              {quickMode && (
                <Badge variant="secondary" className="ml-2 gap-1 text-xs bg-orange-100 text-orange-700 border border-orange-200">
                  <FiZap className="h-3 w-3" />
                  Quick Mode
                </Badge>
              )}
            </DialogTitle>
            {userRole === "admin" || userRole === "manager" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={quickMode ? "outline" : "secondary"}
                      size="sm"
                      onClick={toggleMode}
                      className={`gap-1.5 ${quickMode ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'}`}
                    >
                      {quickMode ? (
                        <>
                          <FiMaximize2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Show All Fields</span>
                        </>
                      ) : (
                        <>
                          <FiMinimize2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Quick Mode</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border border-gray-200 text-gray-700 shadow-md">
                    {quickMode ? "Show all available fields" : "Show only essential fields"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <DialogDescription className="mt-1 text-gray-600">
            {item
              ? "Update the details of this inventory item"
              : "Add a new item to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6">
          {quickMode ? (
            // Quick Mode Layout - Single column with only essential fields
            <div className="space-y-5 max-w-xl mx-auto">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                  className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={handleNumberChange}
                    required
                    className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                      errors.quantity ? "border-red-500" : ""
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onValueChange={(value) =>
                      handleChange({ name: "unit", value })
                    }
                  >
                    <SelectTrigger 
                      className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                        errors.unit ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md">
                      {commonUnits.map((unit) => (
                        <SelectItem
                          key={unit}
                          value={unit}
                          className="hover:bg-orange-50"
                        >
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) =>
                    handleChange({ name: "category", value })
                  }
                >
                  <SelectTrigger 
                    className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                      errors.category ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md">
                    {allCategories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="hover:bg-orange-50"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <motion.div 
                className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-blue-600 dark:text-blue-300 flex items-center">
                  <FiZap className="mr-2 h-4 w-4" />
                  <span className="font-medium">Quick Mode Active</span>
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                  You&apos;re using quick mode which includes only essential
                  fields.
                  {userRole === "admin" || userRole === "manager" &&
                    " Toggle to full mode to add details like cost, reorder level, images, and supplier info."}
                </p>
              </motion.div>
            </div>
          ) : (
            // Full Mode Layout - Organized with clear sections
            <div className="space-y-8">
              {/* Basic Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center">
                  <FiPackage className="mr-2 h-4 w-4 text-primary" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter item name"
                      required
                      className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="category"
                      value={formData.category}
                      onValueChange={(value) =>
                        handleChange({ name: "category", value })
                      }
                    >
                      <SelectTrigger 
                        className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                          errors.category ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md">
                        {allCategories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="hover:bg-orange-50"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.quantity}
                        onChange={handleNumberChange}
                        required
                        className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                          errors.quantity ? "border-red-500" : ""
                        }`}
                      />
                      {errors.quantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                        Unit <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        name="unit"
                        value={formData.unit}
                        onValueChange={(value) =>
                          handleChange({ name: "unit", value })
                        }
                      >
                        <SelectTrigger 
                          className={`border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                            errors.unit ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md">
                          {commonUnits.map((unit) => (
                            <SelectItem
                              key={unit}
                              value={unit}
                              className="hover:bg-orange-50"
                            >
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unit && (
                        <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter item description"
                      className="min-h-[100px] border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Inventory Management Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center">
                  <FiDollarSign className="mr-2 h-4 w-4 text-primary" />
                  Inventory Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <Label
                      htmlFor="costPerUnit"
                      className="text-sm font-medium text-gray-700"
                    >
                      Cost Per Unit <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="costPerUnit"
                        name="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={handleNumberChange}
                        required
                        className={`pl-8 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                          errors.cost ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {item && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Total value: {formatCurrency(formData.cost * formData.quantity)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="reorderPoint"
                      className="text-sm font-medium text-gray-700"
                    >
                      Reorder Level
                    </Label>
                    <Input
                      id="reorderPoint"
                      name="reorder_level"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.reorder_level}
                      onChange={handleNumberChange}
                      className="border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <FiAlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                      The quantity at which you&apos;ll be alerted to reorder this item
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="maxStock"
                      className="text-sm font-medium text-gray-700"
                    >
                      Maximum Stock Level
                    </Label>
                    <Input
                      id="maxStock"
                      name="max_stock"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.max_stock}
                      onChange={handleNumberChange}
                      className="border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for inventory level visualization (optional)
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Additional Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center">
                  <FiInfo className="mr-2 h-4 w-4 text-primary" />
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                    >
                      <FiMapPin className="h-4 w-4 text-muted-foreground" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Storage location"
                      className="border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {suppliers && suppliers.length > 0 && (
                    <div>
                      <Label
                        htmlFor="supplierId"
                        className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                      >
                        <FiTruck className="h-4 w-4 text-muted-foreground" />
                        Supplier
                      </Label>
                      <Select
                        name="supplier_id"
                        value={formData.supplier_id}
                        onValueChange={(value) =>
                          handleChange({ name: "supplier_id", value })
                        }
                      >
                        <SelectTrigger 
                          className="border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        >
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md">
                          <SelectItem value="">None</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label
                      htmlFor="expiryDate"
                      className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                    >
                      <FiCalendar className="h-4 w-4 text-muted-foreground" />
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="imageUrl"
                      className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                    >
                      <FiImage className="h-4 w-4 text-muted-foreground" />
                      Product Image URL
                    </Label>
                    <Input
                      id="imageUrl"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="Enter image URL"
                      className="border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                    {formData.image_url && (
                      <div className="mt-2 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 h-16 w-16">
                        <Image
                          src={formData.image_url}
                          alt={formData.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <DialogFooter className="mt-8 pt-4 border-t flex items-center justify-between">
            <div>
              {item && (
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(item.updated_at).toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="px-6" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {item ? "Saving..." : "Adding..."}
                  </div>
                ) : (
                  item ? "Save Changes" : "Add Item"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
