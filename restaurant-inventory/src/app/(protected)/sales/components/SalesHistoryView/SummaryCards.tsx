import React from "react";
import {
  ArrowUpRight,
  DollarSign,
  ShoppingBag,
  PercentIcon,
} from "lucide-react";

interface SummaryCardsProps {
  isLoading: boolean;
  totalSales: number;
  totalOrders: number;
  formatCurrency: (value: number) => string;
  averageOrderValue?: number;
}

export const SummaryCards = ({
  isLoading,
  totalSales,
  totalOrders,
  formatCurrency,
  averageOrderValue,
}: SummaryCardsProps) => {
  // Calculate average order value if not provided directly
  const avgOrderValue =
    averageOrderValue || (totalOrders > 0 ? totalSales / totalOrders : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-2">
      {/* Total Sales Card */}
      <div className="border border-neutral-100 rounded-lg p-5 flex flex-col transition-all hover:border-orange-100">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Total Sales
            </span>
            <span className="text-2xl font-semibold mt-2 text-neutral-900">
              {isLoading ? (
                <span className="loading loading-dots loading-sm text-orange-600"></span>
              ) : (
                formatCurrency(totalSales)
              )}
            </span>
          </div>
          <div className="text-orange-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
          <span>+15% from previous period</span>
        </div>
      </div>

      {/* Total Orders Card */}
      <div className="border border-neutral-100 rounded-lg p-5 flex flex-col transition-all hover:border-blue-100">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Total Orders
            </span>
            <span className="text-2xl font-semibold mt-2 text-neutral-900">
              {isLoading ? (
                <span className="loading loading-dots loading-sm text-blue-600"></span>
              ) : (
                totalOrders
              )}
            </span>
          </div>
          <div className="text-blue-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
          <span>+8% from previous period</span>
        </div>
      </div>

      {/* Average Order Value Card */}
      <div className="border border-neutral-100 rounded-lg p-5 flex flex-col transition-all hover:border-purple-100">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Average Order
            </span>
            <span className="text-2xl font-semibold mt-2 text-neutral-900">
              {isLoading ? (
                <span className="loading loading-dots loading-sm text-purple-600"></span>
              ) : (
                formatCurrency(avgOrderValue)
              )}
            </span>
          </div>
          <div className="text-purple-600">
            <PercentIcon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
          <span>-3% from previous period</span>
        </div>
      </div>
    </div>
  );
};
