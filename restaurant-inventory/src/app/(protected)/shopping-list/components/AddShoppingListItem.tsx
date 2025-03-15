"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { FiX } from "react-icons/fi";

interface AddShoppingListItemProps {
  isVisible: boolean;
  itemName: string;
  onItemNameChange: (value: string) => void;
  itemQuantity: number;
  onItemQuantityChange: (value: number) => void;
  itemUnit: string;
  onItemUnitChange: (value: string) => void;
  itemCategory: string;
  onItemCategoryChange: (value: string) => void;
  itemCost: number;
  onItemCostChange: (value: number) => void;
  categories: string[];
  onAddItem: () => void;
  onCancel: () => void;
}

export default function AddShoppingListItem({
  isVisible,
  itemName,
  onItemNameChange,
  itemQuantity,
  onItemQuantityChange,
  itemUnit,
  onItemUnitChange,
  itemCategory,
  onItemCategoryChange,
  itemCost,
  onItemCostChange,
  categories,
  onAddItem,
  onCancel,
}: AddShoppingListItemProps) {
  if (!isVisible) return null;

  // Common units
  const units = ["kg", "g", "l", "ml", "units", "boxes", "cans", "bottles"];

  // Format categories for the Combobox
  const categoryOptions: ComboboxOption[] = [
    { value: "Other", label: "Other" },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Add Item to Shopping List</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={onCancel}
          >
            <FiX className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => onItemNameChange(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-quantity">Quantity</Label>
              <Input
                id="item-quantity"
                type="number"
                min="0.1"
                step="0.1"
                value={itemQuantity}
                onChange={(e) => onItemQuantityChange(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-unit">Unit</Label>
              <Select value={itemUnit} onValueChange={onItemUnitChange}>
                <SelectTrigger id="item-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-category">Category</Label>
            <Combobox
              options={categoryOptions}
              value={itemCategory}
              onValueChange={onItemCategoryChange}
              placeholder="Select category"
              emptyText="No category found"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-cost">Estimated Cost</Label>
            <Input
              id="item-cost"
              type="number"
              min="0"
              step="0.01"
              value={itemCost}
              onChange={(e) => onItemCostChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button onClick={onAddItem}>Add to Shopping List</Button>
        </div>
      </div>
    </Card>
  );
}
