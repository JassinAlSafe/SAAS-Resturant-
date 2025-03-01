"use client";

import { useState, useEffect, useMemo } from "react";
import { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Common units for inventory items
const COMMON_UNITS = [
  "kg",
  "g",
  "L",
  "ml",
  "pcs",
  "bunch",
  "can",
  "bottle",
  "box",
  "pack",
  "case",
];

// Common categories for restaurant inventory
const COMMON_CATEGORIES = [
  "Produce",
  "Meat",
  "Seafood",
  "Dairy",
  "Pantry",
  "Herbs",
  "Spices",
  "Beverages",
  "Bakery",
  "Frozen",
  "Cleaning",
  "Disposables",
  "Equipment",
  "Other",
];

type InventoryItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
  item?: InventoryItem;
  customCategories?: string[];
};

export default function InventoryItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  customCategories = [],
}: InventoryItemModalProps) {
  // Combine default categories with any custom ones from the database
  const allCategories = useMemo(() => {
    return [...new Set([...COMMON_CATEGORIES, ...customCategories])].sort();
  }, [customCategories]);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [unit, setUnit] = useState(COMMON_UNITS[0]);
  const [reorderLevel, setReorderLevel] = useState("0");
  const [cost, setCost] = useState("0");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
      setReorderLevel(item.reorderLevel.toString());
      setCost(item.cost.toString());
    } else {
      // Reset form for new item
      setName("");
      setCategory(allCategories[0] || "");
      setQuantity("0");
      setUnit(COMMON_UNITS[0]);
      setReorderLevel("0");
      setCost("0");
      setCustomCategory("");
      setShowCustomCategory(false);
    }
    setErrors({});
  }, [item, isOpen, allCategories]);

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (showCustomCategory && !customCategory.trim()) {
      newErrors.category = "Category is required";
    }

    if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = "Quantity must be a positive number";
    }

    if (isNaN(Number(reorderLevel)) || Number(reorderLevel) < 0) {
      newErrors.reorderLevel = "Reorder level must be a positive number";
    }

    if (isNaN(Number(cost)) || Number(cost) < 0) {
      newErrors.cost = "Cost must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const finalCategory = showCustomCategory ? customCategory : category;

    onSave({
      name,
      category: finalCategory,
      quantity: Number(quantity),
      unit,
      reorderLevel: Number(reorderLevel),
      cost: Number(cost),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Inventory Item" : "Add New Inventory Item"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Update the details of this inventory item"
              : "Add a new item to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tomatoes, Cleaning Spray, Napkins"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            {!showCustomCategory ? (
              <>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setShowCustomCategory(true);
                    } else {
                      setCategory(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      + Add Custom Category
                    </SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="flex-1"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Current Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reorder Level and Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">
                Reorder Alert Level <span className="text-red-500">*</span>
                <span className="block text-xs text-muted-foreground">
                  You'll be alerted when stock falls below this level
                </span>
              </Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                step="0.01"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
              />
              {errors.reorderLevel && (
                <p className="text-sm text-red-500">{errors.reorderLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">
                Cost ($) <span className="text-red-500">*</span>
                <span className="block text-xs text-muted-foreground">
                  Cost per {unit}
                </span>
              </Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
              {errors.cost && (
                <p className="text-sm text-red-500">{errors.cost}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{item ? "Update Item" : "Add Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
