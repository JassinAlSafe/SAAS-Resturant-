"use client";

import { useState, useEffect } from "react";
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
  // State for the form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("units");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [supplierId, setSupplierId] = useState("none");
  const [location, setLocation] = useState("");
  const [quickMode, setQuickMode] = useState(userRole === "staff");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);

  // Combine custom categories with common categories
  const allCategories = [
    ...new Set([...COMMON_CATEGORIES, ...customCategories]),
  ].sort();

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

  // Reset form when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      if (item) {
        // Edit mode - populate form with item data
        setName(item.name);
        setDescription(item.description || "");
        setQuantity(item.quantity);
        setUnit(item.unit);
        setCategory(item.category);
        setCostPerUnit(item.cost_per_unit || item.cost || 0);
        setReorderPoint(item.reorder_level || 0);
        setSupplierId(item.supplier_id || "none");
        setLocation(item.location || "");
        setImageUrl(item.image_url || "");
        setImageError(false);
        // If editing, default to full mode for managers/admins
        setQuickMode(userRole === "staff");
      } else {
        // Add mode - reset form
        setName("");
        setDescription("");
        setQuantity(0);
        setUnit("units");
        setCategory(customCategories.length > 0 ? customCategories[0] : "");
        setCostPerUnit(0);
        setReorderPoint(0);
        setSupplierId("none");
        setLocation("");
        setImageUrl("");
        setImageError(false);
        // Default to quick mode for staff
        setQuickMode(userRole === "staff");
      }
    }
  }, [isOpen, item, customCategories, userRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the final category (use new category if provided)
    const finalCategory = newCategory.trim() ? newCategory : category;

    // Convert "none" supplier value to undefined
    const finalSupplierId = supplierId === "none" ? undefined : supplierId;

    // Create item data object with required fields and their default values
    const itemData: InventoryFormData = {
      name,
      quantity: Number(quantity) || 0,
      unit,
      category: finalCategory,
      cost: quickMode ? 0 : Number(costPerUnit) || 0,
      reorder_level: quickMode ? 0 : Number(reorderPoint) || 0,
      supplier_id: quickMode ? undefined : finalSupplierId,
      image_url: quickMode ? undefined : imageUrl || undefined,
      description: description || undefined,
      location: location || undefined,
    };

    // Call appropriate function based on if we're adding or editing
    if (item && onUpdate) {
      onUpdate(itemData);
    } else {
      onSave(itemData);
    }
  };

  // Toggle quick mode handler
  const toggleQuickMode = () => {
    setQuickMode(!quickMode);
  };

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="unit" className="text-sm font-medium">
                    Unit*
                  </Label>
                  <Select value={unit} onValueChange={setUnit}>
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
                <Select value={category} onValueChange={setCategory} required>
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

                <div className="mt-2">
                  <Label
                    htmlFor="newCategory"
                    className="text-xs text-muted-foreground"
                  >
                    Or add a new category:
                  </Label>
                  <Input
                    id="newCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name"
                    className="mt-1"
                  />
                </div>
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      value={category}
                      onValueChange={setCategory}
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

                    <div className="mt-2">
                      <Label
                        htmlFor="newCategory"
                        className="text-xs text-muted-foreground"
                      >
                        Or add a new category:
                      </Label>
                      <Input
                        id="newCategory"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category name"
                        className="mt-1"
                      />
                    </div>
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
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        required
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit" className="text-sm font-medium">
                        Unit <span className="text-red-500">*</span>
                      </Label>
                      <Select value={unit} onValueChange={setUnit}>
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                      value={costPerUnit}
                      onChange={(e) => setCostPerUnit(Number(e.target.value))}
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
                      value={reorderPoint}
                      onChange={(e) => setReorderPoint(Number(e.target.value))}
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
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
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
                      <Select value={supplierId} onValueChange={setSupplierId}>
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
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageError(false);
                      }}
                      placeholder="Enter image URL"
                      className="mt-1.5"
                    />
                    {imageUrl && (
                      <div className="mt-3 relative h-28 w-28 rounded overflow-hidden border border-gray-200 dark:border-gray-800">
                        {!imageError ? (
                          // Using a regular img tag instead of Next.js Image component
                          <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800">
                            <img
                              src={imageUrl}
                              alt="Product preview"
                              className="object-cover h-full w-full"
                              onError={() => setImageError(true)}
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <div className="flex flex-col items-center justify-center">
                              <FiAlertCircle className="h-6 w-6 text-amber-500" />
                              <span className="text-xs text-muted-foreground mt-1">
                                Image error
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
            <Button type="submit" className="px-6">
              {item ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
