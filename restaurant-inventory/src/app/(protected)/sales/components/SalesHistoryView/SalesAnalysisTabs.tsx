import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { format } from "date-fns";
import { SaleData, SummaryData } from "./types";
import { useState } from "react";
import SalesTable from "../SalesTable";
import { Sale } from "@/lib/types";

const COLORS = [
  "#F97316", // orange-500
  "#FB923C", // orange-400
  "#FDBA74", // orange-300
  "#FED7AA", // orange-200
  "#FFEDD5", // orange-100
  "#EA580C", // orange-600
];

interface SalesAnalysisTabsProps {
  isLoading: boolean;
  salesData: SaleData[];
  summaryData: SummaryData;
  formatCurrency: (value: number) => string;
}

export function SalesAnalysisTabs({
  isLoading,
  salesData,
  summaryData,
  formatCurrency,
}: SalesAnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "categories" | "items" | "transactions"
  >("categories");

  const pieChartData = Object.entries(summaryData.categoryTotals).map(
    ([name, value]) => ({
      name,
      value: value.sales,
    })
  );

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl">
      {/* Tab navigation */}
      <div className="flex justify-center pt-5 px-6 mb-4">
        <div className="inline-flex rounded-full p-1 bg-orange-50/50 border border-gray-100 shadow-sm">
          <button
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-full transition-colors ${
              activeTab === "categories"
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
                : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
            }`}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </button>

          <button
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-full transition-colors ${
              activeTab === "items"
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
                : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
            }`}
            onClick={() => setActiveTab("items")}
          >
            Top Items
          </button>

          <button
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-full transition-colors ${
              activeTab === "transactions"
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
                : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Tab content container */}
      <div className="px-5 pb-5">
        {/* Categories Tab Content */}
        {activeTab === "categories" && (
          <CategoryAnalysis
            isLoading={isLoading}
            pieChartData={pieChartData}
            categoryTotals={summaryData.categoryTotals}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Items Tab Content */}
        {activeTab === "items" && (
          <TopItemsAnalysis
            isLoading={isLoading}
            salesData={salesData}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Transactions Tab Content */}
        {activeTab === "transactions" && (
          <TransactionHistory
            isLoading={isLoading}
            salesData={salesData}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}

interface CategoryAnalysisProps {
  isLoading: boolean;
  pieChartData: Array<{ name: string; value: number }>;
  categoryTotals: SummaryData["categoryTotals"];
  formatCurrency: (value: number) => string;
}

function CategoryAnalysis({
  isLoading,
  pieChartData,
  categoryTotals,
  formatCurrency,
}: CategoryAnalysisProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Sales by Category</h3>
        <p className="text-sm text-gray-500">
          Distribution of sales across different categories
        </p>
      </div>

      <div className="h-[400px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          </div>
        ) : pieChartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Sales",
                    ]}
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-y-auto max-h-[300px] pr-2">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1].sales - a[1].sales)
                    .map(([category, data], index) => (
                      <tr
                        key={index}
                        className="hover:bg-orange-50/30 transition-colors"
                      >
                        <td className="py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            {category}
                          </div>
                        </td>
                        <td className="py-3 text-right font-medium text-orange-600">
                          {formatCurrency(data.sales)}
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center justify-center bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs">
                            {data.items}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}

interface TopItemsAnalysisProps {
  isLoading: boolean;
  salesData: SaleData[];
  formatCurrency: (value: number) => string;
}

function TopItemsAnalysis({
  isLoading,
  salesData,
  formatCurrency,
}: TopItemsAnalysisProps) {
  // Calculate top selling items
  const topItems = salesData.reduce((acc: Record<string, number>, sale) => {
    sale.items.forEach((item) => {
      const itemName = item.name;
      if (!acc[itemName]) {
        acc[itemName] = 0;
      }
      acc[itemName] += item.quantity;
    });
    return acc;
  }, {});

  // Convert to array and sort
  const sortedItems = Object.entries(topItems)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Top Selling Items</h3>
        <p className="text-sm text-gray-500">
          Most popular items by quantity sold
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100">
        {isLoading ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          </div>
        ) : sortedItems.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Sold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedItems.map((item, index) => {
                // Find the category for this item from any sale
                const category =
                  salesData
                    .find((sale) =>
                      sale.items.some((i) => i.name === item.name)
                    )
                    ?.items.find((i) => i.name === item.name)?.category ||
                  "Unknown";

                return (
                  <tr
                    key={index}
                    className="hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-orange-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 font-normal">
                        {category}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}

interface TransactionHistoryProps {
  isLoading: boolean;
  salesData: SaleData[];
  formatCurrency: (value: number) => string;
}

function TransactionHistory({
  isLoading,
  salesData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatCurrency,
}: TransactionHistoryProps) {
  // Convert the sales data to the expected format for SalesTable
  const adaptSalesToTableFormat = (data: SaleData[]): Sale[] => {
    return data.map((sale) => ({
      id: sale.id,
      date: sale.date,
      amount: sale.total,
      items: sale.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod: sale.paymentMethod,
    }));
  };

  const salesForTable = adaptSalesToTableFormat(salesData);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Transaction History
        </h3>
        <p className="text-sm text-gray-500">
          Detailed view of all transactions in the period
        </p>
      </div>

      <div>
        {isLoading ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          </div>
        ) : salesForTable.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <SalesTable sales={salesForTable} />
          </div>
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
            No transactions in the selected period
          </div>
        )}
      </div>
    </div>
  );
}
