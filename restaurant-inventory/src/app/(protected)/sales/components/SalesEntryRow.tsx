"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dish } from "@/lib/types";
import { useCurrency } from "@/lib/currency-provider";
import { InventoryImpactItem } from "../types";

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

  return (
    <div
      className="grid grid-cols-12 gap-6 items-center px-6 py-4 hover:bg-muted/30 transition-colors group"
      data-testid={`sales-entry-row-${dish.id}`}
    >
      <div className="col-span-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-sm md:text-base">{dish.name}</div>
            {dish.category && (
              <Badge variant="outline" className="text-xs font-normal mt-1">
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
                className="text-xs font-normal"
              >
                {impact.name}: {impact.quantityUsed} {impact.unit}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="col-span-2 text-sm">{formatCurrency(dish.price)}</div>
      <div className="col-span-2">
        <Input
          type="number"
          min={0}
          value={quantity || ""}
          onChange={(e) => {
            const newQuantity = parseInt(e.target.value) || 0;
            onQuantityChange(dish.id, newQuantity);
          }}
          className="w-full h-9"
          aria-label={`Quantity for ${dish.name}`}
          role="spinbutton"
        />
      </div>
      <div className="col-span-2 text-sm font-medium">
        {formatCurrency(dishTotal)}
      </div>
    </div>
  );
}
