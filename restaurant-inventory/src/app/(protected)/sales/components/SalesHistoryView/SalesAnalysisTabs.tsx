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
  "#FD9A46", // a lighter orange
  "#FDBA74", // orange-300
  "#FFB686", // a peach color
  "#FED7AA", // orange-200
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
    <div className="bg-white border-none shadow-sm rounded-xl">
      {/* Tab navigation */}
      <div className="flex justify-center pt-5 px-6 mb-4">
        <div className="inline-flex rounded-full p-1 bg-orange-50/50 border-0">
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
        <h3 className="text-lg font-medium text-neutral-800">
          Sales by Category
        </h3>
        <p className="text-sm text-neutral-500">
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
              <table className="table table-sm">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th>Category</th>
                    <th className="text-right">Sales</th>
                    <th className="text-right">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1].sales - a[1].sales)
                    .map(([category, data], index) => (
                      <tr
                        key={index}
                        className="hover:bg-orange-50/30 transition-colors"
                      >
                        <td className="font-medium">
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
                        <td className="text-right font-medium text-orange-600">
                          {formatCurrency(data.sales)}
                        </td>
                        <td className="text-right">
                          <span className="inline-flex items-center justify-center bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-sm">
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
          <div className="w-full h-full flex items-center justify-center text-neutral-500">
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
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-neutral-800">
          Top Selling Items
        </h3>
        <p className="text-sm text-neutral-500">
          Most popular items by quantity and revenue
        </p>
      </div>

      {isLoading ? (
        <div className="h-[350px] w-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
        </div>
      ) : salesData.length > 0 ? (
        <div className="overflow-y-auto max-h-[400px]">
          <table className="table table-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="w-[40%]">Item</th>
                <th className="w-[20%]">Category</th>
                <th className="text-right w-[20%]">Quantity</th>
                <th className="text-right w-[20%]">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesData
                .flatMap((sale) => sale.items)
                .reduce<
                  Array<{
                    dish_name: string;
                    quantity: number;
                    total: number;
                    category: string;
                  }>
                >((acc, item) => {
                  const existing = acc.find(
                    (i) => i.dish_name === item.dish_name
                  );
                  if (existing) {
                    existing.quantity += item.quantity;
                    existing.total += item.total;
                  } else {
                    acc.push({
                      dish_name: item.dish_name,
                      quantity: item.quantity,
                      total: item.total,
                      category: item.category,
                    });
                  }
                  return acc;
                }, [])
                .sort((a, b) => b.total - a.total)
                .slice(0, 10)
                .map((item, index) => (
                  <tr key={index}>
                    <td className="font-medium">{item.dish_name}</td>
                    <td>
                      <Badge className="bg-orange-50 text-orange-600 border-none hover:bg-orange-100">
                        {item.category || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <span className="inline-flex items-center justify-center bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-sm">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="text-right font-medium text-orange-600">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[350px] w-full flex items-center justify-center text-neutral-500">
          No data available for the selected period
        </div>
      )}
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
  // Adapter function to convert SaleData to Sale[]
  const adaptSalesToTableFormat = (data: SaleData[]): Sale[] => {
    return data.map((sale) => ({
      id: sale.id || `sale-${Math.random().toString(36).substring(7)}`,
      date: sale.date,
      dishId: sale.items[0]?.dish_name || "multiple",
      dishName: sale.items.map((item) => item.dish_name).join(", "),
      quantity: sale.items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: sale.total,
      createdAt: sale.date, // Use date as createdAt since it's required
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-neutral-800">
          Transaction History
        </h3>
        <p className="text-sm text-neutral-500">
          Detailed record of all sales transactions
        </p>
      </div>

      {isLoading ? (
        <div className="h-[350px] w-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
        </div>
      ) : (
        <SalesTable
          sales={adaptSalesToTableFormat(salesData)}
          onRefresh={() => {}}
        />
      )}
    </div>
  );
}
