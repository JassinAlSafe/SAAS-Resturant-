import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, Doughnut } from "react-chartjs-2";
import { Badge } from "@/components/ui/badge";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
  PieChart,
  ListFilter,
  Download,
  Info,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ReportMetrics } from "../types";

// Improved type definitions using the Chart.js type structure
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface TopDish {
  name: string;
  sales: number;
  rank: number;
}

interface SalesAnalyticsViewProps {
  salesData: ChartData;
  topDishesData: ChartData;
  previousPeriodData?: ReportMetrics;
  dateRange: string;
  formatCurrency: (amount: number) => string;
  getPercentageChange: (current: number, previous: number) => number;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        boxWidth: 12,
        padding: 16,
        usePointStyle: true,
      },
    },
    tooltip: {
      padding: 12,
      caretSize: 6,
      cornerRadius: 4,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.06)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

export function SalesAnalyticsView({
  salesData,
  topDishesData,
  previousPeriodData,
  dateRange,
  formatCurrency,
  getPercentageChange,
}: SalesAnalyticsViewProps) {
  // Extract summary data from charts using useMemo for optimization
  const { totalSales, totalTransactions, averageOrderValue, topDishesTable } =
    useMemo(() => {
      const totalSales =
        salesData.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0;
      const totalTransactions =
        salesData.datasets[1]?.data.reduce((a, b) => a + b, 0) || 0;
      const averageOrderValue = totalTransactions
        ? totalSales / totalTransactions
        : 0;

      // Generate top dishes for table view
      const topDishesTable: TopDish[] = topDishesData.labels.map(
        (dish, index) => ({
          name: dish,
          sales: topDishesData.datasets[0].data[index],
          rank: index + 1,
        })
      );

      return {
        totalSales,
        totalTransactions,
        averageOrderValue,
        topDishesTable,
      };
    }, [salesData, topDishesData]);

  // Calculate percentage changes with null checks and proper property names
  const salesPercentChange = getPercentageChange(
    totalSales,
    previousPeriodData?.totalSales ?? 0
  );
  const transactionsPercentChange = getPercentageChange(
    totalTransactions,
    previousPeriodData?.totalOrders ?? 0
  );
  const averageOrderPercentChange = getPercentageChange(
    averageOrderValue,
    previousPeriodData?.avgOrderValue ?? 0
  );

  // Format the period label for display
  const getPeriodLabel = () => {
    switch (dateRange) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 90 days";
      case "1y":
        return "Last 12 months";
      default:
        return "Custom period";
    }
  };

  // Extracted component for percentage change display to reduce repetition
  const PercentageChange = ({ value }: { value: number }) => (
    <div className="flex items-center gap-2">
      {value >= 0 ? (
        <>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-0 font-normal"
          >
            <ArrowUpRight className="h-3 w-3 mr-1" aria-hidden="true" />
            {value.toFixed(1)}%
          </Badge>
          <span className="text-sm text-muted-foreground">
            vs. previous period
          </span>
        </>
      ) : (
        <>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-0 font-normal"
          >
            <ArrowDownRight className="h-3 w-3 mr-1" aria-hidden="true" />
            {Math.abs(value).toFixed(1)}%
          </Badge>
          <span className="text-sm text-muted-foreground">
            vs. previous period
          </span>
        </>
      )}
    </div>
  );

  const currentDate = format(new Date(), "MMM d, yyyy");

  return (
    <div className="space-y-8">
      {/* Page header with date range info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground">
            {getPeriodLabel()} • {currentDate}
          </p>
        </div>

        <div className="flex gap-2">
          <Tooltip content="Download data as CSV or Excel">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Export Data
            </Button>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <ListFilter className="h-4 w-4 mr-2" aria-hidden="true" />
                Filter View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Revenue Only</DropdownMenuItem>
              <DropdownMenuItem>Transactions Only</DropdownMenuItem>
              <DropdownMenuItem>Combined View</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Sales Card */}
        <Card className="relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-bl-full"
            aria-hidden="true"
          ></div>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {formatCurrency(totalSales)}
              </CardTitle>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Sales information</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">Sales Breakdown</h4>
                    <Badge variant="outline">{getPeriodLabel()}</Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Total sales amount for the selected period.</p>
                    <p className="mt-2">
                      Previous period:{" "}
                      {formatCurrency(previousPeriodData?.totalSales ?? 0)}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardHeader>
          <CardContent>
            <PercentageChange value={salesPercentChange} />
          </CardContent>
        </Card>

        {/* Total Transactions Card */}
        <Card className="relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-20 w-20 bg-blue-50 rounded-bl-full"
            aria-hidden="true"
          ></div>
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {totalTransactions.toLocaleString()}
              </CardTitle>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Transaction information</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">Transaction Details</h4>
                    <Badge variant="outline">{getPeriodLabel()}</Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Total number of orders for the selected period.</p>
                    <p className="mt-2">
                      Previous period:{" "}
                      {(previousPeriodData?.totalOrders ?? 0).toLocaleString()}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardHeader>
          <CardContent>
            <PercentageChange value={transactionsPercentChange} />
          </CardContent>
        </Card>

        {/* Average Order Value Card */}
        <Card className="relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-20 w-20 bg-amber-50 rounded-bl-full"
            aria-hidden="true"
          ></div>
          <CardHeader className="pb-2">
            <CardDescription>Average Order Value</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {formatCurrency(averageOrderValue)}
              </CardTitle>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Average order information</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">Average Order Details</h4>
                    <Badge variant="outline">{getPeriodLabel()}</Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Average amount spent per transaction.</p>
                    <p className="mt-2">
                      Previous period:{" "}
                      {formatCurrency(previousPeriodData?.avgOrderValue ?? 0)}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardHeader>
          <CardContent>
            <PercentageChange value={averageOrderPercentChange} />
          </CardContent>
        </Card>
      </div>

      {/* Sales Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales Chart - Takes 2/3 of the space */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Sales Performance
                </CardTitle>
                <CardDescription>
                  Revenue and transaction trends over time
                </CardDescription>
              </div>
              <Tabs defaultValue="bar" className="w-auto">
                <TabsList className="grid h-8 w-auto grid-cols-2">
                  <TabsTrigger
                    value="bar"
                    className="h-8 flex items-center gap-1"
                  >
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Bar</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="line"
                    className="h-8 flex items-center gap-1"
                  >
                    <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Line</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80" aria-label="Sales performance chart">
              <Bar data={salesData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Top Dishes Chart - Takes 1/3 of the space */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold">
              Top Selling Items
            </CardTitle>
            <CardDescription>Distribution by sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-2 h-9 mb-4">
                <TabsTrigger value="chart" className="flex items-center gap-1">
                  <PieChart className="h-4 w-4" aria-hidden="true" />
                  <span>Chart</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-1">
                  <ListFilter className="h-4 w-4" aria-hidden="true" />
                  <span>Table</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="mt-0">
                <div className="h-64" aria-label="Top selling items chart">
                  <Doughnut
                    data={topDishesData}
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      cutout: "65%",
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topDishesTable.map((dish) => (
                        <TableRow key={dish.name}>
                          <TableCell>{dish.rank}</TableCell>
                          <TableCell className="font-medium">
                            {dish.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(dish.sales)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button variant="link" className="text-xs">
              View detailed sales by item
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
