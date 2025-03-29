import React from "react";
import { ChevronRight, UtensilsCrossed, X } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{dishName}</h3>
                <p className="text-sm text-gray-500">
                  Performance for {periodLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Orders</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {quantity}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Revenue</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(revenue)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Cost</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(cost)}
                  </div>
                </div>
                <div
                  className={`rounded-lg p-4 ${
                    profitMargin >= 0 ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="text-sm text-gray-500 mb-1">
                    Profit Margin
                  </div>
                  <div
                    className={`text-xl font-semibold ${
                      profitMargin >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Profit Analysis */}
              <div className="mb-6 rounded-lg border border-gray-100 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Profit Analysis
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Revenue per unit:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(revenue / quantity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cost per unit:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(cost / quantity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Profit per unit:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(profit / quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-600">Cost vs. Revenue</span>
                      <span className="text-gray-900">
                        {((cost / revenue) * 100).toFixed(1)}% Cost
                      </span>
                    </div>
                    <div className="bg-gray-200 h-2 w-full rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full"
                        style={{ width: `${(cost / revenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients Table */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Ingredients Used
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Per Dish
                        </th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Used
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ingredients.map((ingredient) => (
                        <tr key={ingredient.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            <Link
                              href={`/inventory?highlight=${ingredient.id}`}
                              className="hover:text-orange-500 flex items-center"
                            >
                              {ingredient.name}
                              <ChevronRight className="h-4 w-4 inline ml-1 text-orange-500" />
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            {ingredient.quantity} {ingredient.unit}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            {(ingredient.quantity * quantity).toFixed(1)}{" "}
                            {ingredient.unit}
                          </td>
                        </tr>
                      ))}
                      {ingredients.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center text-gray-500 py-6"
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
              <div className="flex justify-end gap-3 pt-2">
                <Link href={`/recipes/${dishId}`}>
                  <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors">
                    View Recipe
                  </button>
                </Link>
                <button
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
