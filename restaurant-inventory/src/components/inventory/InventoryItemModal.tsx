"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { COMMON_CATEGORIES, COMMON_UNITS } from "@/lib/constants";
import { supplierService } from "@/lib/services/supplier-service";
import { useCurrency } from "@/lib/currency-context";
import { InventoryItem, Supplier } from "@/lib/types";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import EntityNotes from "@/components/EntityNotes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  // Get currency from context
  const { currency } = useCurrency();

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
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  // Fetch suppliers from the API
  const fetchSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to load suppliers:", error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
      setReorderLevel(item.reorderLevel.toString());
      setCost(item.cost.toString());
      setExpiryDate(item.expiryDate ? new Date(item.expiryDate) : undefined);
      setSupplierId(item.supplierId || "none");
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
      setExpiryDate(undefined);
      setSupplierId("none");
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
    const finalSupplierId = supplierId === "none" ? undefined : supplierId;

    onSave({
      name,
      category: finalCategory,
      quantity: Number(quantity),
      unit,
      reorderLevel: Number(reorderLevel),
      cost: Number(cost),
      expiryDate: expiryDate ? format(expiryDate, "yyyy-MM-dd") : undefined,
      supplierId: finalSupplierId,
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

        {item ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
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
                      Reorder Alert Level{" "}
                      <span className="text-red-500">*</span>
                      <span className="block text-xs text-muted-foreground">
                        You&apos;ll be alerted when stock falls below this level
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
                      <p className="text-sm text-red-500">
                        {errors.reorderLevel}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">
                      Cost ({currency.symbol}){" "}
                      <span className="text-red-500">*</span>
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

                {/* Expiry Date and Supplier */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">
                      Expiry Date
                      <span className="block text-xs text-muted-foreground">
                        When this item will expire
                      </span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiryDate ? (
                            format(expiryDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {expiryDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-auto p-0 text-xs text-muted-foreground"
                        onClick={() => setExpiryDate(undefined)}
                      >
                        Clear date
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">
                      Supplier
                      <span className="block text-xs text-muted-foreground">
                        Who supplies this item
                      </span>
                    </Label>
                    <Select
                      value={supplierId || "none"}
                      onValueChange={setSupplierId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {isLoadingSuppliers ? (
                          <SelectItem value="loading" disabled>
                            Loading suppliers...
                          </SelectItem>
                        ) : (
                          suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {item ? "Update Item" : "Add Item"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            <TabsContent value="notes" className="py-4">
              <EntityNotes
                entityType="inventory"
                entityId={item.id}
                entityName={item.name}
              />
              <div className="flex justify-end mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
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
                    You&apos;ll be alerted when stock falls below this level
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
                  Cost ({currency.symbol}){" "}
                  <span className="text-red-500">*</span>
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

            {/* Expiry Date and Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">
                  Expiry Date
                  <span className="block text-xs text-muted-foreground">
                    When this item will expire
                  </span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? (
                        format(expiryDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {expiryDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-auto p-0 text-xs text-muted-foreground"
                    onClick={() => setExpiryDate(undefined)}
                  >
                    Clear date
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">
                  Supplier
                  <span className="block text-xs text-muted-foreground">
                    Who supplies this item
                  </span>
                </Label>
                <Select
                  value={supplierId || "none"}
                  onValueChange={setSupplierId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {isLoadingSuppliers ? (
                      <SelectItem value="loading" disabled>
                        Loading suppliers...
                      </SelectItem>
                    ) : (
                      suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{item ? "Update Item" : "Add Item"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
