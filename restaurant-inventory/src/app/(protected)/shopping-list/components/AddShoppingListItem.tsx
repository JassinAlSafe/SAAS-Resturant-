"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { FiX, FiShoppingBag, FiTag, FiDollarSign } from "react-icons/fi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Common units grouped by type for better organization
  const unitGroups = {
    weight: ["kg", "g", "mg", "lb", "oz"],
    volume: ["l", "ml", "gal", "qt", "pt", "fl oz", "cup"],
    count: ["units", "pieces", "boxes", "cans", "bottles", "packs", "bunches"],
  };

  // Format categories for the Combobox
  const categoryOptions: ComboboxOption[] = [
    { value: "Other", label: "Other" },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!itemName.trim()) {
      newErrors.name = "Item name is required";
    }

    if (itemQuantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!itemUnit) {
      newErrors.unit = "Please select a unit";
    }

    if (itemCost < 0) {
      newErrors.cost = "Cost cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAddItem();
    }
  };

  const isFormValid =
    itemName.trim() !== "" && itemQuantity > 0 && itemUnit !== "";

  if (!isVisible) return null;

  return (
    <Card className="mb-6 border border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between space-y-0 border-b border-gray-100">
        <CardTitle className="text-lg font-medium flex items-center text-black">
          <FiShoppingBag className="h-5 w-5 mr-2 text-orange-500" />
          Add Item to Shopping List
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={onCancel}
                aria-label="Close"
              >
                <FiX className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-md">
              <TabsTrigger
                value="basic"
                className={`rounded-md py-1.5 ${
                  activeTab === "basic"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className={`rounded-md py-1.5 ${
                  activeTab === "details"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Details
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4">
            <TabsContent value="basic" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="item-name"
                  className="font-medium text-gray-700"
                >
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="item-name"
                    placeholder="Enter item name"
                    value={itemName}
                    onChange={(e) => {
                      onItemNameChange(e.target.value);
                      if (errors.name) {
                        setErrors({ ...errors, name: "" });
                      }
                    }}
                    autoFocus
                    className={`border ${
                      errors.name ? "border-red-500" : "border-gray-200"
                    } rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {itemName && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-700"
                      onClick={() => onItemNameChange("")}
                      aria-label="Clear item name"
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-500 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="item-quantity"
                    className="font-medium text-gray-700"
                  >
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={itemQuantity}
                    onChange={(e) => {
                      onItemQuantityChange(Number(e.target.value));
                      if (errors.quantity) {
                        setErrors({ ...errors, quantity: "" });
                      }
                    }}
                    className={`border ${
                      errors.quantity ? "border-red-500" : "border-gray-200"
                    } rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    aria-invalid={errors.quantity ? "true" : "false"}
                    aria-describedby={
                      errors.quantity ? "quantity-error" : undefined
                    }
                  />
                  {errors.quantity && (
                    <p
                      id="quantity-error"
                      className="text-sm text-red-500 mt-1"
                    >
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="item-unit"
                    className="font-medium text-gray-700"
                  >
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={itemUnit}
                    onValueChange={(value) => {
                      onItemUnitChange(value);
                      if (errors.unit) {
                        setErrors({ ...errors, unit: "" });
                      }
                    }}
                  >
                    <SelectTrigger
                      id="item-unit"
                      className={`border ${
                        errors.unit ? "border-red-500" : "border-gray-200"
                      } rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      aria-invalid={errors.unit ? "true" : "false"}
                      aria-describedby={errors.unit ? "unit-error" : undefined}
                    >
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
                      <SelectItem value="custom">Custom</SelectItem>
                      {Object.entries(unitGroups).map(([group, groupUnits]) => (
                        <div key={group}>
                          <p className="px-2 text-xs text-gray-500 uppercase my-1">
                            {group}
                          </p>
                          {groupUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p id="unit-error" className="text-sm text-red-500 mt-1">
                      {errors.unit}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="item-category"
                  className="font-medium text-gray-700 flex items-center"
                >
                  <FiTag className="h-4 w-4 mr-1.5 text-gray-600" />
                  Category
                </Label>
                <Combobox
                  options={categoryOptions}
                  value={itemCategory}
                  onValueChange={onItemCategoryChange}
                  placeholder="Select category"
                  emptyText="No category found"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {categories.slice(0, 5).map((category) => (
                    <Badge
                      key={category}
                      variant={
                        itemCategory === category ? "default" : "outline"
                      }
                      className={`cursor-pointer px-2 py-1 text-xs rounded-full ${
                        itemCategory === category
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => onItemCategoryChange(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="item-cost"
                  className="font-medium text-gray-700 flex items-center"
                >
                  <FiDollarSign className="h-4 w-4 mr-1.5 text-gray-600" />
                  Estimated Cost
                </Label>
                <Input
                  id="item-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemCost}
                  onChange={(e) => {
                    onItemCostChange(Number(e.target.value));
                    if (errors.cost) {
                      setErrors({ ...errors, cost: "" });
                    }
                  }}
                  className={`border ${
                    errors.cost ? "border-red-500" : "border-gray-200"
                  } rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  aria-invalid={errors.cost ? "true" : "false"}
                  aria-describedby={errors.cost ? "cost-error" : undefined}
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p id="cost-error" className="text-sm text-red-500 mt-1">
                    {errors.cost}
                  </p>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="px-4 py-3 flex justify-between items-center border-t border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="mr-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className={`relative px-4 py-2 rounded-md ${
                isFormValid
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add to Shopping List
              {!isFormValid && (
                <span className="absolute -top-1 -right-1">
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    !
                  </Badge>
                </span>
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
