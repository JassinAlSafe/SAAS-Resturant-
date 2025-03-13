import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import { SaleData, SummaryData } from "./types";

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
  const pieChartData = Object.entries(summaryData.categoryTotals).map(
    ([name, value]) => ({
      name,
      value: value.sales,
    })
  );

  return (
    <div className="rounded-lg border bg-card">
      <Tabs defaultValue="categories" className="w-full">
        <div className="border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Top Items</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="categories" className="p-6">
          <CategoryAnalysis
            isLoading={isLoading}
            pieChartData={pieChartData}
            categoryTotals={summaryData.categoryTotals}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="items" className="p-6">
          <TopItemsAnalysis
            isLoading={isLoading}
            salesData={salesData}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="transactions" className="p-6">
          <TransactionHistory
            isLoading={isLoading}
            salesData={salesData}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
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
        <h3 className="text-lg font-medium">Sales by Category</h3>
        <p className="text-sm text-muted-foreground">
          Distribution of sales across different categories
        </p>
      </div>

      <div className="h-[400px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="h-[350px] w-full" />
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
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1].sales - a[1].sales)
                    .map(([category, data], index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            {category}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(data.sales)}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.items}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
        <h3 className="text-lg font-medium">Top Selling Items</h3>
        <p className="text-sm text-muted-foreground">
          Most popular items by quantity and revenue
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : salesData.length > 0 ? (
        <div className="overflow-y-auto max-h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead className="w-[20%]">Category</TableHead>
                <TableHead className="text-right w-[20%]">Quantity</TableHead>
                <TableHead className="text-right w-[20%]">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.dish_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/5">
                        {item.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="w-full h-[200px] flex items-center justify-center text-muted-foreground">
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
        <h3 className="text-lg font-medium">Transaction History</h3>
        <p className="text-sm text-muted-foreground">
          Detailed list of all transactions
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : salesData.length > 0 ? (
        <div className="overflow-y-auto max-h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[25%]">Date</TableHead>
                <TableHead className="w-[55%]">Items</TableHead>
                <TableHead className="text-right w-[20%]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {format(new Date(sale.date), "EEEE, MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(sale.total)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="w-full h-[200px] flex items-center justify-center text-muted-foreground">
          No data available for the selected period
        </div>
      )}
    </div>
  );
}
