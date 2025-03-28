import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Info,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ReportMetrics } from "../types";
// Import the components directly from their source files
import { ExportButton } from "@/components/ui/Common/ExportButton/ExportButton";
import { exportData } from "@/components/ui/Common/ExportButton/ExportUtils";
import {
  StyledDropdown,
  DropdownItem,
} from "@/components/ui/Common/StyledDropdown";

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

  // Get the current date for display
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Export handlers
  const handleExportSalesData = () => {
    // Make sure salesData and essential properties exist
    if (
      !salesData ||
      !salesData.labels ||
      !salesData.datasets ||
      !salesData.datasets[0]
    ) {
      console.error("Essential sales data missing for export");
      return;
    }

    try {
      // Create formatted data with whatever is available
      const formattedData = salesData.labels.map((label, index) => {
        const dataPoint: Record<string, string | number> = { date: label };

        // Add revenue if dataset[0] exists
        if (salesData.datasets[0]?.data) {
          dataPoint.revenue = salesData.datasets[0].data[index] || 0;
        }

        // Add orders if dataset[1] exists, otherwise set to 0
        if (salesData.datasets[1]?.data) {
          dataPoint.orders = salesData.datasets[1].data[index] || 0;
        } else {
          dataPoint.orders = 0;
        }

        return dataPoint;
      });

      // Create headers based on what data is available
      const headers: Record<string, string> = { date: "Date" };
      if (salesData.datasets[0]) headers.revenue = "Revenue";
      if (salesData.datasets[1]) headers.orders = "Orders";

      exportData(formattedData, "csv", `sales-analytics-${dateRange}`, headers);
      console.log("Export successful", { rows: formattedData.length });
    } catch (error) {
      console.error("Error exporting sales data:", error);
    }
  };

  const handleExportTopDishes = () => {
    // Make sure topDishesTable exists and has data
    if (!topDishesTable || !topDishesTable.length) {
      console.error("Top dishes data is not properly formatted for export");
      return;
    }

    try {
      const formattedData = topDishesTable.map((dish) => ({
        rank: dish.rank || 0,
        name: dish.name || "Unknown",
        sales: dish.sales || 0,
        revenue: (dish.sales || 0) * 10, // Dummy calculation as in the original code
      }));

      exportData(formattedData, "csv", `top-dishes-${dateRange}`, {
        rank: "Rank",
        name: "Item Name",
        sales: "Units Sold",
        revenue: "Revenue",
      });
    } catch (error) {
      console.error("Error exporting top dishes data:", error);
    }
  };

  // Check if export data is ready
  const isSalesDataReady = useMemo(() => {
    // Add debug logging to see what's happening
    console.log("Sales data check:", {
      hasData: !!salesData,
      hasLabels: !!(salesData?.labels?.length > 0),
      hasDatasets: !!(salesData?.datasets?.length > 0),
      hasDataset0: !!salesData?.datasets?.[0],
      hasDataset0Data: !!(salesData?.datasets?.[0]?.data?.length > 0),
      hasDataset1: !!salesData?.datasets?.[1],
      hasDataset1Data: !!(salesData?.datasets?.[1]?.data?.length > 0),
    });

    // Relax the check to require only the first dataset
    return !!(
      salesData &&
      salesData.labels?.length > 0 &&
      salesData.datasets?.length > 0 &&
      salesData.datasets[0]?.data?.length > 0
    );
  }, [salesData]);

  const isTopDishesDataReady = useMemo(() => {
    // Add debug logging
    console.log("Top dishes check:", {
      hasTopDishesTable: !!topDishesTable,
      tableLength: topDishesTable?.length || 0,
    });

    return !!(topDishesTable?.length > 0);
  }, [topDishesTable]);

  // Add an explicit export function with debugging
  const handleExportSalesDataClick = () => {
    console.log("Export button clicked, data ready:", isSalesDataReady);
    if (isSalesDataReady) {
      handleExportSalesData();
    }
  };

  const handleExportTopDishesClick = () => {
    console.log(
      "Export top dishes button clicked, data ready:",
      isTopDishesDataReady
    );
    if (isTopDishesDataReady) {
      handleExportTopDishes();
    }
  };

  // Define filter actions for the main view
  const filterViewActions: DropdownItem[] = [
    {
      label: "Revenue Only",
      onClick: () => console.log("Filter: Revenue Only"),
    },
    {
      label: "Transactions Only",
      onClick: () => console.log("Filter: Transactions Only"),
    },
    {
      label: "Combined View",
      onClick: () => console.log("Filter: Combined View"),
    },
  ];

  // Define filter actions for the top dishes
  const dishFilterActions: DropdownItem[] = [
    {
      label: "All categories",
      onClick: () => console.log("Filter: All categories"),
    },
    {
      label: "Main dishes",
      onClick: () => console.log("Filter: Main dishes"),
    },
    {
      label: "Appetizers",
      onClick: () => console.log("Filter: Appetizers"),
    },
    {
      label: "Desserts",
      onClick: () => console.log("Filter: Desserts"),
    },
    {
      label: "Beverages",
      onClick: () => console.log("Filter: Beverages"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header with date range info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground">
            {getPeriodLabel()} • {currentDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            label="Export Data"
            size="md"
            onExport={handleExportSalesDataClick}
            variant="ghost"
            disabled={false}
            title="Export to CSV"
            appearance="minimal"
            className="h-9 hover:bg-secondary/80 text-foreground"
          />

          <StyledDropdown
            items={filterViewActions}
            label="Filter View"
            icon={<ListFilter className="h-4 w-4" />}
            variant="ghost"
            className="h-9 hover:bg-secondary/80 text-foreground"
          />
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Sales Card */}
        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Sales
                </p>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSales)}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <PercentageChange value={salesPercentChange} />
            </div>
          </CardContent>
        </Card>

        {/* Total Transactions Card */}
        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Orders
                </p>
                <div className="text-2xl font-bold">
                  {totalTransactions.toLocaleString()}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <PercentageChange value={transactionsPercentChange} />
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value Card */}
        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Average Order
                </p>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageOrderValue)}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <PercentageChange value={averageOrderPercentChange} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-semibold">
              Sales Performance
            </CardTitle>
            <CardDescription>
              Revenue and order volume for {getPeriodLabel()}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:bg-secondary/80"
                >
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Info</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">About this chart</h4>
                    <p className="text-sm">
                      This chart displays the sales revenue (bars) and number of
                      orders (line) over time, allowing you to track performance
                      trends in the selected period.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <ExportButton
              label="Export"
              size="sm"
              onExport={handleExportSalesDataClick}
              className="h-8 hover:bg-secondary/80 text-foreground"
              variant="ghost"
              disabled={false}
              title="Export to CSV"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={salesData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Items */}
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-semibold">
              Top Selling Items
            </CardTitle>
            <CardDescription>
              Best performing dishes by sales volume
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <StyledDropdown
              items={dishFilterActions}
              label="Filter"
              icon={<ListFilter className="h-4 w-4" />}
              variant="ghost"
              size="sm"
              className="h-8 hover:bg-secondary/80 text-foreground"
            />
            <ExportButton
              label="Export"
              size="sm"
              onExport={handleExportTopDishesClick}
              className="h-8 hover:bg-secondary/80 text-foreground"
              variant="ghost"
              disabled={false}
              title="Export to CSV"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="chart" className="w-full">
            <div className="flex justify-center px-4 pt-1">
              <TabsList className="border-0 bg-secondary/50">
                <TabsTrigger value="chart">Chart View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="chart" className="mt-0 p-6">
              <div className="h-80 flex items-center justify-center">
                <div className="h-full w-full max-w-md">
                  <Doughnut
                    data={topDishesData}
                    options={{
                      ...chartOptions,
                      cutout: "65%",
                    }}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="table" className="mt-0">
              <div className="border rounded-md mt-2 mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDishesTable.map((dish) => (
                      <TableRow key={dish.name}>
                        <TableCell className="text-center">
                          {dish.rank}
                        </TableCell>
                        <TableCell className="font-medium">
                          {dish.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {dish.sales.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dish.sales * 10)}{" "}
                          {/* Dummy price calculation */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end p-4">
                <Button variant="link" size="sm">
                  View all items
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
