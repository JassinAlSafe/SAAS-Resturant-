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
      className="grid grid-cols-12 gap-6 items-center px-4 py-4 mb-2 bg-white border-none shadow-sm rounded-xl hover:shadow-md transition-all"
      data-testid={`sales-entry-row-${dish.id}`}
    >
      <div className="col-span-6">
        <div className="font-medium text-neutral-700">{dish.name}</div>
        {dish.category && (
          <div className="mt-1.5">
            <span className="inline-flex px-2 py-0.5 text-xs font-normal bg-orange-50 rounded-full text-orange-600">
              {dish.category}
            </span>
          </div>
        )}

        {showInventoryImpact && inventoryImpact.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {inventoryImpact.map((impact, index) => (
              <span
                key={index}
                className={`inline-flex px-2 py-0.5 text-xs font-normal rounded-full ${
                  impact.quantityUsed > 0
                    ? "bg-orange-50 text-orange-600"
                    : "bg-orange-50/50 text-orange-500"
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
        <div className="flex items-center bg-orange-50/50 rounded-full p-1">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity === 0}
            className="flex items-center justify-center w-7 h-7 text-orange-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="h-3 w-3" />
          </button>

          <span className="w-6 text-center text-neutral-700 font-medium">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500"
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
