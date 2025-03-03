"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { InventoryItem } from "@/lib/types";

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => void;
  onUpdate?: (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => void;
  item?: InventoryItem;
  customCategories?: string[];
}

export default function InventoryItemModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  item,
  customCategories = [],
}: InventoryItemModalProps) {
  // State for the form
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("units");
  const [category, setCategory] = useState("");
  const [cost, setCost] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

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
        setQuantity(item.quantity);
        setUnit(item.unit);
        setCategory(item.category);
        setCost(item.cost);
        setReorderLevel(item.reorderLevel);
      } else {
        // Add mode - reset form
        setName("");
        setQuantity(0);
        setUnit("units");
        setCategory(customCategories.length > 0 ? customCategories[0] : "");
        setCost(0);
        setReorderLevel(0);
      }
      setNewCategory("");
      setIsAddingCategory(false);
    }
  }, [isOpen, item, customCategories]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create item data object
    const itemData = {
      name,
      quantity,
      unit,
      category: isAddingCategory && newCategory ? newCategory : category,
      cost,
      reorderLevel,
    };

    // Call appropriate function based on if we're adding or editing
    if (item && onUpdate) {
      onUpdate(itemData);
    } else {
      onSave(itemData);
    }
  };

  // Toggle between selecting existing category and adding new one
  const toggleAddCategory = () => {
    setIsAddingCategory(!isAddingCategory);
    if (!isAddingCategory) {
      setCategory("");
    } else {
      setNewCategory("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Inventory Item" : "Add Inventory Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit">
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>{isAddingCategory ? "New Category" : "Category"}</Label>
              <Button
                type="button"
                variant="link"
                className="px-0 h-auto text-xs"
                onClick={toggleAddCategory}
              >
                {isAddingCategory ? "Select Existing" : "Add New Category"}
              </Button>
            </div>

            {isAddingCategory ? (
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                required={isAddingCategory}
              />
            ) : (
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {customCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                step="1"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{item ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
