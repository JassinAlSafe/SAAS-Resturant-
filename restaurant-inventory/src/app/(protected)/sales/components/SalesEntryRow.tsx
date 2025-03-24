"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dish } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { InventoryImpactItem } from "../types";
import { Minus, Plus } from "lucide-react";

interface SalesEntryRowProps {
  dish: Dish;
  quantity: number;
  onQuantityChange: (dishId: string, quantity: number) => void;
  showInventoryImpact: boolean;
  inventoryImpact: InventoryImpactItem[];
}

export function SalesEntryRow({
  dish,
  quantity,
  onQuantityChange,
  showInventoryImpact,
  inventoryImpact,
}: SalesEntryRowProps) {
  const { formatCurrency } = useCurrency();
  const dishTotal = dish.price * quantity;

  const handleIncrement = () => {
    onQuantityChange(dish.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(dish.id, quantity - 1);
    }
  };

  return (
    <div
      className="grid grid-cols-12 gap-6 items-center px-8 py-4 hover:bg-slate-50/60 border-b border-slate-200/70 transition-colors"
      data-testid={`sales-entry-row-${dish.id}`}
    >
      <div className="col-span-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm md:text-base text-slate-900 truncate">
              {dish.name}
            </div>
            {dish.category && (
              <Badge
                variant="outline"
                className="text-xs font-normal mt-1.5 text-slate-600 bg-slate-100/60 border-slate-200"
              >
                {dish.category}
              </Badge>
            )}
          </div>
        </div>
        {showInventoryImpact && inventoryImpact.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {inventoryImpact.map((impact, index) => (
              <Badge
                key={index}
                variant={impact.quantityUsed > 0 ? "secondary" : "outline"}
                className="text-xs font-normal px-1.5 py-0.5"
              >
                {impact.name}: {impact.quantityUsed} {impact.unit}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="col-span-2 text-sm font-medium text-slate-800">
        {formatCurrency(dish.price)}
      </div>
      <div className="col-span-2">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={quantity === 0}
            className="h-8 w-8 bg-white border-slate-200"
          >
            <Minus className="h-4 w-4 text-slate-500" />
            <span className="sr-only">Decrease quantity</span>
          </Button>

          <Input
            type="number"
            min={0}
            value={quantity || ""}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 0;
              onQuantityChange(dish.id, newQuantity);
            }}
            className="w-14 h-9 text-center border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label={`Quantity for ${dish.name}`}
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            className="h-8 w-8 bg-white border-slate-200"
          >
            <Plus className="h-4 w-4 text-slate-500" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
      </div>
      <div className="col-span-2 text-sm font-medium text-slate-900">
        {formatCurrency(dishTotal)}
      </div>
    </div>
  );
}
