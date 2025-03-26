import React from "react";
import { ChevronRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface DishDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
  dishId: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  ingredients: Ingredient[];
  formatCurrency: (amount: number) => string;
  isLoading?: boolean;
  periodLabel: string;
}

export function DishDetailsModal({
  isOpen,
  onClose,
  dishName,
  dishId,
  quantity,
  revenue,
  cost,
  profit,
  ingredients,
  formatCurrency,
  isLoading = false,
  periodLabel,
}: DishDetailsProps) {
  // Calculate profit margin
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center gap-2 text-xl">
          <UtensilsCrossed className="h-5 w-5" />
          <h3 className="font-bold">{dishName}</h3>
        </div>
        <p className="py-2 text-base-content text-opacity-60">
          Dish performance for {periodLabel}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-base-300 rounded animate-pulse w-3/4 mx-auto"></div>
            <div className="h-20 bg-base-300 rounded animate-pulse"></div>
            <div className="h-40 bg-base-300 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 my-4">
              <div className="bg-base-200 rounded-md p-3">
                <div className="text-sm text-base-content text-opacity-60">
                  Orders
                </div>
                <div className="text-2xl font-semibold">{quantity}</div>
              </div>
              <div className="bg-base-200 rounded-md p-3">
                <div className="text-sm text-base-content text-opacity-60">
                  Revenue
                </div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(revenue)}
                </div>
              </div>
              <div className="bg-base-200 rounded-md p-3">
                <div className="text-sm text-base-content text-opacity-60">
                  Cost
                </div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(cost)}
                </div>
              </div>
              <div
                className={`rounded-md p-3 ${
                  profitMargin >= 0
                    ? "bg-success bg-opacity-10"
                    : "bg-error bg-opacity-10"
                }`}
              >
                <div className="text-sm text-base-content text-opacity-60">
                  Profit Margin
                </div>
                <div className="text-2xl font-semibold">
                  {profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            <div className="mt-4 border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Profit Analysis</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Revenue per unit:</span>
                    <span className="font-medium">
                      {formatCurrency(revenue / quantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cost per unit:</span>
                    <span className="font-medium">
                      {formatCurrency(cost / quantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Profit per unit:</span>
                    <span className="font-medium">
                      {formatCurrency(profit / quantity)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Cost vs. Revenue</span>
                    <span>{((cost / revenue) * 100).toFixed(1)}% Cost</span>
                  </div>
                  <div className="bg-base-300 h-2 w-full rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${(cost / revenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Ingredients Used</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-right">Quantity Per Dish</th>
                      <th className="text-right">Total Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr key={ingredient.id}>
                        <td>
                          <Link
                            href={`/inventory?highlight=${ingredient.id}`}
                            className="hover:underline flex items-center"
                          >
                            {ingredient.name}
                            <ChevronRight className="h-4 w-4 inline ml-1" />
                          </Link>
                        </td>
                        <td className="text-right">
                          {ingredient.quantity} {ingredient.unit}
                        </td>
                        <td className="text-right">
                          {(ingredient.quantity * quantity).toFixed(1)}{" "}
                          {ingredient.unit}
                        </td>
                      </tr>
                    ))}
                    {ingredients.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center text-base-content text-opacity-60 py-4"
                        >
                          No ingredient data available for this dish
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-action">
              <Link href={`/recipes/${dishId}`}>
                <button className="btn btn-outline">View Recipe</button>
              </Link>
              <button className="btn" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
