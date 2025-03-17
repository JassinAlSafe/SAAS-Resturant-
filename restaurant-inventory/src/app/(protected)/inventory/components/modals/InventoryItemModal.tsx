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
  FiAlertCircle,
} from "react-icons/fi";

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

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialFormData]);

  // Memoize categories to avoid recalculation
  const allCategories = useMemo(() => {
    const uniqueCategories = new Set([
      ...COMMON_CATEGORIES,
      ...customCategories,
    ]);
    return Array.from(uniqueCategories).sort();
  }, [customCategories]);

  // Use callbacks for event handlers to prevent unnecessary re-renders
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when field is updated
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

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = value === "" ? 0 : parseFloat(value);

      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));

      // Clear error when field is updated
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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.unit) newErrors.unit = "Unit is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        // Call the appropriate handler based on whether we're adding or editing
        if (item) {
          onUpdate?.(formData);
        } else {
          onSave(formData);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setIsSubmitting(false);
      }
    },
    [formData, item, onSave, onUpdate]
  );

  const toggleQuickMode = useCallback(() => {
    setQuickMode((prev) => !prev);
  }, []);

  // Determine if user can see advanced options
  const canAccessAdvanced = userRole === "admin" || userRole === "manager";

  // Common units
  const commonUnits = [
    "units",
    "kg",
    "g",
    "l",
    "ml",
    "pieces",
    "boxes",
    "cans",
    "bottles",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl flex items-center gap-2">
              {item ? "Edit Inventory Item" : "Add Inventory Item"}
              {quickMode && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <FiZap className="mr-1 h-3 w-3" />
                  Quick Mode
                </span>
              )}
            </DialogTitle>
            {canAccessAdvanced && (
              <Button
                variant={quickMode ? "outline" : "secondary"}
                size="sm"
                onClick={toggleQuickMode}
                className="gap-1.5"
              >
                {quickMode ? (
                  <>
                    <FiMaximize2 className="h-4 w-4" />
                    <span>Show All Fields</span>
                  </>
                ) : (
                  <>
                    <FiMinimize2 className="h-4 w-4" />
                    <span>Quick Mode</span>
                  </>
                )}
              </Button>
            )}
          </div>
          <DialogDescription className="mt-1">
            {item
              ? "Update the details of this inventory item"
              : "Add a new item to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4">
          {quickMode ? (
            // Quick Mode Layout - Single column with only essential fields
            <div className="space-y-5 max-w-xl mx-auto">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Item Name*
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Quantity*
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={handleNumberChange}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="unit" className="text-sm font-medium">
                    Unit*
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "unit", value } })
                    }
                  >
                    <SelectTrigger id="unit" className="mt-1.5">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonUnits.map((unitOption) => (
                        <SelectItem key={unitOption} value={unitOption}>
                          {unitOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Category*</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleChange({ target: { name: "category", value } })
                  }
                  required
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-600 dark:text-blue-300 flex items-center">
                  <FiZap className="mr-2 h-4 w-4" />
                  <span className="font-medium">Quick Mode</span>
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                  You&apos;re using quick mode which includes only essential
                  fields.
                  {canAccessAdvanced &&
                    " Toggle to full mode to add details like cost, reorder level, images, and supplier info."}
                </p>
              </div>
            </div>
          ) : (
            // Full Mode Layout - Organized with clear sections
            <div className="space-y-8">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center">
                  <FiPackage className="mr-2 h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-md">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter item name"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleChange({ target: { name: "category", value } })
                      }
                      required
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.quantity}
                        onChange={handleNumberChange}
                        required
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit" className="text-sm font-medium">
                        Unit <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          handleChange({ target: { name: "unit", value } })
                        }
                      >
                        <SelectTrigger id="unit" className="mt-1.5">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonUnits.map((unitOption) => (
                            <SelectItem key={unitOption} value={unitOption}>
                              {unitOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter item description"
                      className="min-h-[100px] mt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Management Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center">
                  <FiDollarSign className="mr-2 h-4 w-4" />
                  Inventory Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-md">
                  <div>
                    <Label
                      htmlFor="costPerUnit"
                      className="text-sm font-medium"
                    >
                      Cost Per Unit <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="costPerUnit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={handleNumberChange}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="reorderPoint"
                      className="text-sm font-medium"
                    >
                      Reorder Level
                    </Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.reorder_level}
                      onChange={handleNumberChange}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The quantity at which you&apos;ll be alerted to reorder
                      this item
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center">
                  <FiInfo className="mr-2 h-4 w-4" />
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-md">
                  <div>
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <FiMapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Storage location"
                      className="mt-1.5"
                    />
                  </div>

                  {suppliers && suppliers.length > 0 && (
                    <div>
                      <Label
                        htmlFor="supplierId"
                        className="text-sm font-medium flex items-center gap-1.5"
                      >
                        <FiTruck className="h-4 w-4" />
                        Supplier
                      </Label>
                      <Select
                        value={formData.supplier_id}
                        onValueChange={(value) =>
                          handleChange({
                            target: { name: "supplier_id", value },
                          })
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
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
                      htmlFor="imageUrl"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      <FiImage className="h-4 w-4" />
                      Product Image URL
                    </Label>
                    <Input
                      id="imageUrl"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="Enter image URL"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-8 pt-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" className="px-6" disabled={isSubmitting}>
              {item ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
