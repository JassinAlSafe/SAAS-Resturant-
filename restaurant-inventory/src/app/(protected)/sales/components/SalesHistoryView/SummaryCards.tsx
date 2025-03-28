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
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Performance Summary
        </h2>
        <p className="text-sm text-gray-500">
          Key metrics for the selected period
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Sales Card */}
        <div className="border border-orange-100 bg-white rounded-xl p-5 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Sales
              </span>
              <span className="text-2xl font-semibold mt-2 text-gray-900">
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin"></div>
                ) : (
                  formatCurrency(totalSales)
                )}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
            <span>+15% from previous period</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="border border-orange-100 bg-white rounded-xl p-5 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Orders
              </span>
              <span className="text-2xl font-semibold mt-2 text-gray-900">
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin"></div>
                ) : (
                  totalOrders
                )}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
            <span>+8% from previous period</span>
          </div>
        </div>

        {/* Average Order Value Card */}
        <div className="border border-orange-100 bg-white rounded-xl p-5 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Average Order
              </span>
              <span className="text-2xl font-semibold mt-2 text-gray-900">
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin"></div>
                ) : (
                  formatCurrency(avgOrderValue)
                )}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
              <PercentIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
            <span>-3% from previous period</span>
          </div>
        </div>
      </div>
    </div>
  );
};
