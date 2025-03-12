"use client";

import { useState } from "react";
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

export default function SalesEntryForm({
  dishes,
  salesEntries,
  dateString,
  onDateChange,
  onQuantityChange,
  onSubmit,
  onAddDishFromRecipe,
  total,
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateChange(format(date, "yyyy-MM-dd"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
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
            variant={showInventoryImpact ? "default" : "outline"}
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
        </div>

        <div className="flex items-center gap-2">
          {hasPreviousDayTemplate && (
            <Button
              type="button"
              variant="outline"
              onClick={onLoadPreviousDay}
              className="whitespace-nowrap"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Load Previous Day
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onClearAll}
            className="whitespace-nowrap"
          >
            <Trash className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
            <div className="col-span-4">Dish</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2"></div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              {dishes.map((dish) => {
                const quantity = salesEntries[dish.id] || 0;
                const dishTotal = dish.price * quantity;
                const inventoryImpact = showInventoryImpact
                  ? calculateInventoryImpact(dish.id, quantity)
                  : [];

                return (
                  <div
                    key={dish.id}
                    className="grid grid-cols-12 gap-4 items-center py-2"
                  >
                    <div className="col-span-4">
                      <div>
                        <span className="font-medium">{dish.name}</span>
                        {dish.category && (
                          <Badge variant="outline" className="ml-2">
                            {dish.category}
                          </Badge>
                        )}
                      </div>
                      {showInventoryImpact && inventoryImpact.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {inventoryImpact.map((impact) => (
                            <div
                              key={impact.ingredientId}
                              className="text-xs text-muted-foreground"
                            >
                              {impact.name}: -{impact.quantityUsed}{" "}
                              {impact.unit}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      {formatCurrency(dish.price || 0)}
                    </div>
                    <div className="col-span-2">
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
                        className="w-24"
                      />
                    </div>
                    <div className="col-span-2">
                      {formatCurrency(dishTotal || 0)}
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-lg font-semibold">
            Total: {formatCurrency(total)}
          </div>
          <Button type="submit" disabled={isSubmitting || total === 0}>
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
