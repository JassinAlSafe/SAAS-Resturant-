import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import { SaleData, SummaryData } from "./types";
import { useState } from "react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#EC7063",
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
    <div className="border border-neutral-100 rounded-lg">
      <div className="tabs tabs-bordered w-full">
        <button
          className={`tab text-sm font-medium px-6 ${
            activeTab === "categories" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>

        <button
          className={`tab text-sm font-medium px-6 ${
            activeTab === "items" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("items")}
        >
          Top Items
        </button>

        <button
          className={`tab text-sm font-medium px-6 ${
            activeTab === "transactions" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div>

      <div className="p-5">
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
            <span className="loading loading-spinner loading-md text-orange-600"></span>
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
                      <tr key={index}>
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
                        <td className="text-right">
                          {formatCurrency(data.sales)}
                        </td>
                        <td className="text-right">{data.items}</td>
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
          <span className="loading loading-spinner loading-md text-orange-600"></span>
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
                      <Badge variant="outline" className="bg-primary/5">
                        {item.category || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right font-medium">
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
  formatCurrency,
}: TransactionHistoryProps) {
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
          <span className="loading loading-spinner loading-md text-orange-600"></span>
        </div>
      ) : salesData.length > 0 ? (
        <div className="overflow-y-auto max-h-[400px]">
          <table className="table table-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Items</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {salesData
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((sale, index) => (
                  <tr key={index}>
                    <td className="font-medium">
                      {format(new Date(sale.date), "EEEE, MMM d, yyyy")}
                    </td>
                    <td>{format(new Date(sale.date), "h:mm a")}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {sale.items.map((item, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="mb-1 bg-primary/5 whitespace-nowrap"
                          >
                            {item.dish_name} × {item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-right font-medium">
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[350px] w-full flex items-center justify-center text-neutral-500">
          No transactions available for the selected period
        </div>
      )}
    </div>
  );
}
