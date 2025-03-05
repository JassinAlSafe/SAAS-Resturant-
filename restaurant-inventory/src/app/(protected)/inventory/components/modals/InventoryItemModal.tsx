"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryItem, Supplier } from "@/lib/types";
import { FiInfo, FiZap, FiClipboard, FiSettings } from "react-icons/fi";
import { useMediaQueries } from "@/hooks/use-media-query";
import { CustomToggle } from "@/components/ui/custom-toggle";

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    itemData: Omit<InventoryItem, "id" | "created_at" | "updated_at">
  ) => void;
  onUpdate?: (
    itemData: Omit<InventoryItem, "id" | "created_at" | "updated_at">
  ) => void;
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
  userRole = "staff", // Default to staff for most restrictive view
}: InventoryItemModalProps) {
  // State for the form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("units");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [minimumStockLevel, setMinimumStockLevel] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [supplierId, setSupplierId] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [quickMode, setQuickMode] = useState(userRole === "staff");

  // Check if we're on a mobile device
  const { isMobile } = useMediaQueries();

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
        setCostPerUnit(item.cost_per_unit);
        setMinimumStockLevel(item.minimum_stock_level || 0);
        setReorderPoint(item.reorder_point || 0);
        setSupplierId(item.supplier_id || "");
        setLocation(item.location || "");
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
        setMinimumStockLevel(0);
        setReorderPoint(0);
        setSupplierId("");
        setLocation("");
        // Default to quick mode for staff
        setQuickMode(userRole === "staff");
      }
      setNewCategory("");
      setActiveTab("basic");
    }
  }, [isOpen, item, customCategories, userRole]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the final category (use new category if provided)
    const finalCategory = newCategory.trim() ? newCategory : category;

    // Create item data object
    const itemData = {
      name,
      description: quickMode ? "" : description,
      quantity,
      unit,
      category: finalCategory,
      cost_per_unit: quickMode ? 0 : costPerUnit,
      minimum_stock_level: quickMode ? 0 : minimumStockLevel,
      reorder_point: quickMode ? 0 : reorderPoint,
      supplier_id: quickMode ? undefined : supplierId || undefined,
      location: quickMode ? "" : location || undefined,
    };

    // Call appropriate function based on if we're adding or editing
    if (item && onUpdate) {
      onUpdate(itemData);
    } else {
      onSave(itemData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isMobile
            ? "w-full max-w-full h-full max-h-full rounded-none"
            : "sm:max-w-[550px] max-h-[90vh]"
        } overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item ? "Edit Inventory Item" : "Add Inventory Item"}
            {quickMode && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <FiZap className="mr-1 h-3 w-3" /> Quick Mode
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Update the details of this inventory item"
              : "Add a new item to your inventory"}
          </DialogDescription>
        </DialogHeader>

        {canAccessAdvanced && (
          <div className="flex items-center justify-between mb-2 pb-2 border-b">
            <div className="flex items-center gap-2">
              <CustomToggle
                id="quick-mode"
                checked={quickMode}
                onCheckedChange={setQuickMode}
                size="sm"
                color="primary"
                label="Quick Entry Mode"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {quickMode ? "Essential fields only" : "All fields"}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!quickMode && canAccessAdvanced ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <FiClipboard className="h-4 w-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex items-center gap-1"
                >
                  <FiSettings className="h-4 w-4" />
                  <span>Advanced</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                {renderBasicFields()}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                {renderAdvancedFields()}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4 pt-2">{renderBasicFields()}</div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{item ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Helper function to render basic fields
  function renderBasicFields() {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="name" className="font-medium">
            Item Name*
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter item name"
            required
            className="focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="font-medium">
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
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="font-medium">
              Unit*
            </Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger
                id="unit"
                className="focus:ring-2 focus:ring-primary/20"
              >
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
          <Label className="font-medium">Category*</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
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

          <div className="mt-2">
            <Label
              htmlFor="newCategory"
              className="text-sm text-muted-foreground"
            >
              Or add a new category:
            </Label>
            <Input
              id="newCategory"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              className="mt-1 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {!quickMode && (
          <>
            <div className="space-y-2">
              <Label htmlFor="costPerUnit" className="font-medium">
                Cost Per Unit*
              </Label>
              <Input
                id="costPerUnit"
                type="number"
                min="0"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(Number(e.target.value))}
                required
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter item description"
                className="min-h-[80px] focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </>
        )}
      </>
    );
  }

  // Helper function to render advanced fields
  function renderAdvancedFields() {
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minimumStockLevel" className="font-medium">
              Minimum Stock Level
            </Label>
            <Input
              id="minimumStockLevel"
              type="number"
              min="0"
              step="1"
              value={minimumStockLevel}
              onChange={(e) => setMinimumStockLevel(Number(e.target.value))}
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorderPoint" className="font-medium">
              Reorder Point
            </Label>
            <Input
              id="reorderPoint"
              type="number"
              min="0"
              step="1"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(Number(e.target.value))}
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierId" className="font-medium">
            Supplier
          </Label>
          {suppliers.length > 0 ? (
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              placeholder="Enter supplier ID"
              className="focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="font-medium">
            Storage Location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter storage location"
            className="focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2 text-sm">
          <FiInfo className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800">
              Advanced settings help you manage inventory more efficiently:
            </p>
            <ul className="list-disc pl-5 mt-1 text-blue-700 space-y-1">
              <li>Set minimum stock levels to track low inventory</li>
              <li>Define reorder points for automatic notifications</li>
              <li>Link items to suppliers for easy reordering</li>
            </ul>
          </div>
        </div>
      </>
    );
  }
}
