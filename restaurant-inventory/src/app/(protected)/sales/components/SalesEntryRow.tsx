"use client";

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
      className="grid grid-cols-12 gap-6 items-center px-3 py-3 border-b border-neutral-50 hover:bg-neutral-50/30 transition-colors"
      data-testid={`sales-entry-row-${dish.id}`}
    >
      <div className="col-span-6">
        <div className="font-medium text-neutral-700">{dish.name}</div>
        {dish.category && (
          <div className="mt-1.5">
            <span className="inline-flex px-2 py-0.5 text-xs font-normal text-neutral-500">
              {dish.category}
            </span>
          </div>
        )}

        {showInventoryImpact && inventoryImpact.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {inventoryImpact.map((impact, index) => (
              <span
                key={index}
                className={`inline-flex px-2 py-0.5 text-xs font-normal ${
                  impact.quantityUsed > 0
                    ? "text-amber-700"
                    : "text-neutral-500"
                }`}
              >
                {impact.name}: {impact.quantityUsed} {impact.unit}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2 text-sm font-medium text-neutral-600">
        {formatCurrency(dish.price)}
      </div>

      <div className="col-span-2">
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity === 0}
            className="flex items-center justify-center w-7 h-7 text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="h-3 w-3" />
          </button>

          <span className="w-6 text-center text-neutral-700 font-medium">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            className="flex items-center justify-center w-7 h-7 text-orange-500 hover:text-orange-600"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="col-span-2 text-sm font-medium text-orange-600">
        {formatCurrency(dishTotal)}
      </div>
    </div>
  );
}
