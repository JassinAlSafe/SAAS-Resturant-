"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  Eye,
  EyeOff,
} from "lucide-react";
import { SalesEntryFormProps } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/currency-provider";
import { Dish } from "@/lib/types";

export default function SalesEntryForm({
  dishes,
  salesEntries,
  dateString,
  onDateChange,
  onQuantityChange,
  onSubmit,
  onAddDishFromRecipe,
  isSubmitting,
  onToggleInventoryImpact,
  showInventoryImpact,
  calculateInventoryImpact,
  onClearAll,
  onLoadPreviousDay,
  hasPreviousDayTemplate,
}: SalesEntryFormProps) {
  const { formatCurrency } = useCurrency();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateString ? new Date(dateString) : undefined
  );

  // Calculate local total to ensure UI updates
  const [localTotal, setLocalTotal] = useState(0);

  // Recalculate total whenever salesEntries or dishes change
  useEffect(() => {
    let calculatedTotal = 0;

    // Use a clear loop for debugging
    for (const [dishId, quantity] of Object.entries(salesEntries)) {
      const dish = dishes.find((d) => d.id === dishId);
      if (!dish) continue;

      const dishTotal = dish.price * quantity;
      calculatedTotal += dishTotal;
    }

    console.log("Local total calculated:", calculatedTotal);
    setLocalTotal(calculatedTotal);
  }, [salesEntries, dishes]);

  // Use the local total for submission logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit attempted with state:", {
      isSubmitting,
      localTotal,
      selectedDate,
      salesEntries,
    });

    if (isSubmitting) {
      console.log("Submission already in progress");
      return;
    }

    if (localTotal === 0) {
      console.log("Cannot submit with total of 0");
      return;
    }

    if (!selectedDate) {
      console.log("Cannot submit without selected date");
      return;
    }

    console.log("Form submitted with:", {
      date: selectedDate,
      dateString,
      entries: salesEntries,
      total: localTotal,
    });

    try {
      const result = await onSubmit();
      console.log("Submit result:", result);
    } catch (error) {
      console.error("Error submitting sales:", error);
    }
  };

  // Handle quantity change locally as well
  const handleQuantityChange = (dishId: string, newQuantity: number) => {
    console.log("Local quantity change:", {
      dishId,
      newQuantity,
      dish: dishes.find((d) => d.id === dishId),
    });

    // Call the parent handler
    onQuantityChange(dishId, newQuantity);
  };

  // Calculate total for a specific dish
  const calculateDishTotal = (dish: Dish, quantity: number) => {
    const total = dish.price * quantity;
    return total;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log("Date selected:", format(date, "yyyy-MM-dd"));
      setSelectedDate(date);
      onDateChange(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="button"
            variant={showInventoryImpact ? "secondary" : "outline"}
            onClick={onToggleInventoryImpact}
            className="flex items-center gap-2"
          >
            {showInventoryImpact ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showInventoryImpact ? "Hide" : "Show"} Inventory Impact
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClearAll}
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Clear All
            </Button>
            {hasPreviousDayTemplate && (
              <Button
                type="button"
                variant="outline"
                onClick={onLoadPreviousDay}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Load Previous Day
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50">
            <div className="col-span-4 font-medium">Dish</div>
            <div className="col-span-2 font-medium">Price</div>
            <div className="col-span-2 font-medium">Quantity</div>
            <div className="col-span-2 font-medium">Total</div>
            <div className="col-span-2 font-medium"></div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              {dishes.map((dish) => {
                const quantity = salesEntries[dish.id] || 0;
                const dishTotal = calculateDishTotal(dish, quantity);
                const inventoryImpact = showInventoryImpact
                  ? calculateInventoryImpact(dish.id, quantity)
                  : [];

                return (
                  <div
                    key={dish.id}
                    className="grid grid-cols-12 gap-4 items-center py-2"
                  >
                    <div className="col-span-4">
                      <div className="font-medium">{dish.name}</div>
                      {showInventoryImpact && inventoryImpact.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {inventoryImpact.map((impact, index) => (
                            <Badge
                              key={index}
                              variant={
                                impact.quantityUsed > 0 ? "default" : "outline"
                              }
                              className="mr-1 text-xs"
                            >
                              {impact.name}: {impact.quantityUsed} {impact.unit}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      {formatCurrency(dish.price)}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        value={quantity || ""}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          const newTotal = dish.price * newQuantity;
                          console.log("Quantity changed:", {
                            dish: dish.name,
                            quantity: newQuantity,
                            price: dish.price,
                            total: newTotal,
                          });
                          handleQuantityChange(dish.id, newQuantity);
                        }}
                        className="w-24"
                      />
                    </div>
                    <div className="col-span-2">
                      {formatCurrency(dishTotal)}
                    </div>
                    <div className="col-span-2">
                      {dish.recipeId && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddDishFromRecipe(dish.recipeId!)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
          <div className="text-lg font-semibold">
            Total: {formatCurrency(localTotal || 0)}
          </div>
          <Button
            type="submit"
            disabled={!selectedDate || localTotal === 0 || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Sales"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
