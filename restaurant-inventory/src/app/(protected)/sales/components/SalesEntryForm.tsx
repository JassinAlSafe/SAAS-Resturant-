"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Dish } from "@/lib/types";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FiCalendar,
  FiPlus,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useCurrency } from "@/lib/currency-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface SalesEntryFormProps {
  dishes: Dish[];
  salesEntries: { [key: string]: number };
  dateString: string;
  onDateChange: (value: string) => void;
  onQuantityChange: (dishId: string, quantity: number) => void;
  onSubmit: () => Promise<boolean>;
  total: number;
  isSubmitting: boolean;
  onToggleInventoryImpact: () => void;
  showInventoryImpact: boolean;
  calculateInventoryImpact: (dishId: string, quantity: number) => any[];
  onClearAll?: () => void;
  onLoadPreviousDay?: () => void;
  hasPreviousDayTemplate?: boolean;
}

export default function SalesEntryForm({
  dishes,
  salesEntries,
  dateString,
  onDateChange,
  onQuantityChange,
  onSubmit,
  total,
  isSubmitting,
  onToggleInventoryImpact,
  showInventoryImpact,
  calculateInventoryImpact,
  onClearAll,
  onLoadPreviousDay,
  hasPreviousDayTemplate = false,
}: SalesEntryFormProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // State for shift selection and dish management
  const [shift, setShift] = useState<string>("all");
  const [hiddenDishes, setHiddenDishes] = useState<Set<string>>(new Set());
  const [showAddDishForm, setShowAddDishForm] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  // Refs for keyboard navigation
  const quantityInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle submission with confirmation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Tab" && !e.shiftKey) {
      // Let the default Tab behavior work
      return;
    } else if (e.key === "ArrowDown" || (e.key === "Enter" && !e.shiftKey)) {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < quantityInputRefs.current.length) {
        quantityInputRefs.current[nextIndex]?.focus();
      }
    } else if (e.key === "ArrowUp" || (e.key === "Enter" && e.shiftKey)) {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        quantityInputRefs.current[prevIndex]?.focus();
      }
    }
  };

  // Toggle dish visibility
  const toggleDishVisibility = (dishId: string) => {
    setHiddenDishes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });
  };

  // Filter dishes based on shift and visibility
  const filteredDishes = dishes.filter(
    (dish) =>
      !hiddenDishes.has(dish.id) && (shift === "all" || dish.category === shift)
  );

  // Calculate inventory impact for all items
  const allInventoryImpact = Object.entries(salesEntries)
    .filter(([_, quantity]) => quantity > 0)
    .flatMap(([dishId, quantity]) =>
      calculateInventoryImpact(dishId, quantity)
    );

  // Find low stock items (for demonstration - would need actual inventory levels)
  const lowStockItems = allInventoryImpact
    .filter((impact) => impact.quantityUsed > 0) // This is a placeholder - real logic would check against actual inventory
    .reduce((acc, item) => {
      if (!acc[item.ingredientId]) {
        acc[item.ingredientId] = {
          name: item.name,
          unit: item.unit,
          total: 0,
        };
      }
      acc[item.ingredientId].total += item.quantityUsed;
      return acc;
    }, {} as Record<string, { name: string; unit: string; total: number }>);

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Record Daily Sales</h3>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="sale-date" className="mb-2 block">
                Sales Date
              </Label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sale-date"
                  type="date"
                  value={dateString}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="shift-select" className="mb-2 block">
                Shift
              </Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger id="shift-select">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="Breakfast">Morning Shift</SelectItem>
                  <SelectItem value="Lunch">Afternoon Shift</SelectItem>
                  <SelectItem value="Dinner">Evening Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] flex items-end">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDishForm(!showAddDishForm)}
                  className="whitespace-nowrap"
                >
                  {showAddDishForm ? "Cancel" : "Add Dish"}
                  {showAddDishForm ? (
                    <FiX className="ml-2 h-4 w-4" />
                  ) : (
                    <FiPlus className="ml-2 h-4 w-4" />
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onToggleInventoryImpact}
                  className="whitespace-nowrap"
                >
                  {showInventoryImpact ? "Hide" : "Show"} Inventory
                  {showInventoryImpact ? (
                    <FiEyeOff className="ml-2 h-4 w-4" />
                  ) : (
                    <FiEye className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {showAddDishForm && (
            <div className="mb-6 p-4 border rounded-md bg-muted/20">
              <h4 className="font-medium mb-3">Add Unlisted Dish</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="new-dish-name" className="mb-2 block">
                    Dish Name
                  </Label>
                  <Input
                    id="new-dish-name"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="Enter dish name"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor="new-dish-price" className="mb-2 block">
                    Price
                  </Label>
                  <Input
                    id="new-dish-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    disabled={!newDishName || !newDishPrice}
                    onClick={() => {
                      // This would normally call an API to add the dish
                      // For now, just reset the form
                      setNewDishName("");
                      setNewDishPrice("");
                      setShowAddDishForm(false);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Dish</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDishes.map((dish, index) => {
                  const quantity = salesEntries[dish.id] || 0;
                  const totalPrice = dish.price * quantity;

                  return (
                    <TableRow
                      key={dish.id}
                      className={quantity > 0 ? "bg-muted/10" : ""}
                    >
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleDishVisibility(dish.id)}
                        >
                          <FiX className="h-4 w-4" />
                          <span className="sr-only">Hide {dish.name}</span>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {dish.name}
                        {dish.category && (
                          <Badge variant="outline" className="ml-2">
                            {dish.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(dish.price)}</TableCell>
                      <TableCell className="w-40">
                        <Input
                          type="number"
                          min="0"
                          value={quantity || ""}
                          onChange={(e) =>
                            onQuantityChange(
                              dish.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          ref={(el) => (quantityInputRefs.current[index] = el)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(totalPrice)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2">
                  <TableCell
                    colSpan={4}
                    className="text-right font-bold text-lg"
                  >
                    Total:
                  </TableCell>
                  <TableCell className="font-bold text-lg">
                    {formatCurrency(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {showInventoryImpact && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Inventory Impact</h4>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-low-stock"
                    checked={showLowStock}
                    onCheckedChange={(checked) => setShowLowStock(!!checked)}
                  />
                  <Label
                    htmlFor="show-low-stock"
                    className="text-sm cursor-pointer"
                  >
                    Highlight Low Stock
                  </Label>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left">Ingredient</th>
                      <th className="py-2 px-3 text-left">Used</th>
                      <th className="py-2 px-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(salesEntries)
                      .filter(([_, quantity]) => quantity > 0)
                      .flatMap(([dishId, quantity]) => {
                        return calculateInventoryImpact(dishId, quantity).map(
                          (impact, index) => {
                            // This is a placeholder - real logic would check against actual inventory
                            const isLowStock =
                              showLowStock && impact.quantityUsed > 5;

                            return (
                              <tr
                                key={`${dishId}-${impact.ingredientId}-${index}`}
                                className={`border-b ${
                                  isLowStock ? "bg-amber-50" : ""
                                }`}
                              >
                                <td className="py-2 px-3">{impact.name}</td>
                                <td className="py-2 px-3">
                                  {impact.quantityUsed.toFixed(2)} {impact.unit}
                                </td>
                                <td className="py-2 px-3">
                                  {isLowStock && (
                                    <Badge
                                      variant="outline"
                                      className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    >
                                      Low Stock
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          }
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset all quantities to 0
                if (onClearAll) {
                  onClearAll();
                } else {
                  Object.keys(salesEntries).forEach((dishId) => {
                    onQuantityChange(dishId, 0);
                  });
                }
              }}
            >
              Clear All
            </Button>

            {hasPreviousDayTemplate && onLoadPreviousDay && (
              <Button
                type="button"
                variant="outline"
                onClick={onLoadPreviousDay}
              >
                Load Previous Day
              </Button>
            )}

            {hiddenDishes.size > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setHiddenDishes(new Set())}
              >
                Show All Dishes
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || total === 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Saving..." : "Save Sales"}
            {!isSubmitting && <FiSave className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Card>
  );
}
