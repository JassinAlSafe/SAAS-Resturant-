"use client";

import { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiPieChart,
  FiCalendar,
  FiDownload,
} from "react-icons/fi";
import Card from "@/components/Card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/lib/currency-context";
import { CurrencySelector } from "@/components/currency-selector";
import { ExportButton } from "@/components/ui/export-button";
import { exportToExcel } from "@/lib/utils/export";
import { toast } from "sonner";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);

  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // Simulate fetching data from API
  useEffect(() => {
    // In a real app, this would be an API call to Supabase
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Generate dates for the last 7 days
  const getLast7Days = () => {
    return Array.from({ length: 7 })
      .map((_, i) => {
        const date = subDays(new Date(), i);
        return format(date, "MMM dd");
      })
      .reverse();
  };

  // Sales data for the bar chart
  const salesData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: "Sales",
        data: [1250, 1420, 1350, 1650, 1480, 1600, 1750],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  // Top dishes data for the pie chart
  const topDishesData = {
    labels: [
      "Margherita Pizza",
      "Spaghetti Bolognese",
      "Chicken Alfredo",
      "Caesar Salad",
      "Other",
    ],
    datasets: [
      {
        label: "Sales",
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(107, 114, 128, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Inventory usage data for the line chart
  const inventoryUsageData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: "Tomatoes (kg)",
        data: [5, 4.5, 4.8, 5.2, 4.7, 5.0, 5.5],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.3,
      },
      {
        label: "Chicken (kg)",
        data: [3.2, 3.5, 3.3, 3.8, 3.6, 3.9, 4.1],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.3,
      },
      {
        label: "Flour (kg)",
        data: [8, 7.5, 7.8, 8.2, 7.9, 8.3, 8.5],
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.5)",
        tension: 0.3,
      },
    ],
  };

  // Add export handlers for sales and inventory reports
  const handleExportSalesReport = async () => {
    try {
      // Format data for export based on the current tab and date range
      const salesReportData = [
        {
          Date: "Header Row",
          Revenue: "Values in your currency",
          Orders: "Count",
          "Average Order": "Values in your currency",
        },
        ...salesData.labels.map((date, index) => ({
          Date: date,
          Revenue: formatCurrency(salesData.datasets[0].data[index]),
          Orders: Math.floor(salesData.datasets[0].data[index] / 25), // Approximate order count
          "Average Order": formatCurrency(
            salesData.datasets[0].data[index] /
              Math.floor(salesData.datasets[0].data[index] / 25)
          ),
        })),
      ];

      // Add top dishes data
      const topDishesRows = [
        { Dish: "Top Dishes", Percentage: "% of Sales" },
        ...topDishesData.labels.map((dish, index) => ({
          Dish: dish,
          Percentage: `${topDishesData.datasets[0].data[index]}%`,
        })),
      ];

      // Export data to Excel
      exportToExcel(
        [
          ...salesReportData,
          { Date: "", Revenue: "", Orders: "", "Average Order": "" },
          ...topDishesRows,
        ],
        "Sales_Report",
        `Sales Report - ${
          dateRange === "week"
            ? "Last 7 Days"
            : dateRange === "month"
            ? "Last 30 Days"
            : "Last 90 Days"
        }`
      );

      toast.success("Sales report has been exported to Excel.");
    } catch (error) {
      console.error("Error exporting sales report:", error);
      toast.error("There was an error exporting your sales report.");
    }
  };

  const handleExportInventoryReport = async () => {
    try {
      // Format data for export based on inventory usage
      const inventoryReportData = [
        {
          Date: "Header Row",
          ...inventoryUsageData.datasets
            .map((dataset) => dataset.label)
            .reduce((acc, label) => {
              acc[label] = "Amount Used";
              return acc;
            }, {} as Record<string, string>),
        },
        ...inventoryUsageData.labels.map((date, dateIndex) => {
          const rowData: Record<string, string> = { Date: date };

          inventoryUsageData.datasets.forEach((dataset) => {
            rowData[dataset.label] = `${dataset.data[dateIndex]} kg`;
          });

          return rowData;
        }),
      ];

      // Export data to Excel
      exportToExcel(
        inventoryReportData,
        "Inventory_Usage_Report",
        `Inventory Usage - ${
          dateRange === "week"
            ? "Last 7 Days"
            : dateRange === "month"
            ? "Last 30 Days"
            : "Last 90 Days"
        }`
      );

      toast.success("Inventory usage report has been exported to Excel.");
    } catch (error) {
      console.error("Error exporting inventory report:", error);
      toast.error("There was an error exporting your inventory report.");
    }
  };

  // Handler that calls the appropriate export function based on active tab
  const handleExportReport = () => {
    if (activeTab === "sales") {
      handleExportSalesReport();
    } else if (activeTab === "inventory") {
      handleExportInventoryReport();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            View insights and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <CurrencySelector />
          <ExportButton
            onExport={handleExportReport}
            label="Export Report"
            tooltipText={`Export ${
              activeTab === "sales" ? "sales" : "inventory"
            } report to Excel`}
            variant="outline"
          />
          <Button
            variant={activeTab === "sales" ? "default" : "ghost"}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === "sales" ? "active" : "inactive"}
            onClick={() => setActiveTab("sales")}
          >
            Sales Analytics
          </Button>
          <Button
            variant={activeTab === "inventory" ? "default" : "ghost"}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            data-state={activeTab === "inventory" ? "active" : "inactive"}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory Usage
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <FiCalendar className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">Time Range:</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={dateRange === "week" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setDateRange("week")}
            >
              Last 7 Days
            </Button>
            <Button
              variant={dateRange === "month" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setDateRange("month")}
            >
              Last 30 Days
            </Button>
            <Button
              variant={dateRange === "quarter" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setDateRange("quarter")}
            >
              Last 90 Days
            </Button>
          </div>
        </div>
      </Card>

      {/* Sales Analytics Content */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Daily Sales">
            <div className="h-80">
              <Bar
                data={salesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </Card>

          <Card title="Top Selling Dishes">
            <div className="h-80 flex items-center justify-center">
              <div className="w-64">
                <Pie
                  data={topDishesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </Card>

          <Card title="Sales Summary" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(10500)}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  +12% from last period
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  Average Daily Sales
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(1500)}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  +8% from last period
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-semibold mt-1">420</p>
                <p className="text-xs text-green-600 mt-2">
                  +15% from last period
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(25)}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  -3% from last period
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Inventory Usage Content */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Ingredient Usage Trends">
            <div className="h-80">
              <Line
                data={inventoryUsageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </Card>

          <Card title="Inventory Summary">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Usage (Last 7 Days)</TableHead>
                    <TableHead>Projected Depletion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Tomatoes</TableCell>
                    <TableCell>2 kg</TableCell>
                    <TableCell>5.5 kg</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      2.5 days
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Chicken Breast
                    </TableCell>
                    <TableCell>1.5 kg</TableCell>
                    <TableCell>4.1 kg</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      2.6 days
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Mozzarella Cheese
                    </TableCell>
                    <TableCell>0.5 kg</TableCell>
                    <TableCell>2.8 kg</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      1.3 days
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Flour</TableCell>
                    <TableCell>8 kg</TableCell>
                    <TableCell>8.5 kg</TableCell>
                    <TableCell className="text-orange-600 font-medium">
                      6.6 days
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Eggs</TableCell>
                    <TableCell>24 pcs</TableCell>
                    <TableCell>36 pcs</TableCell>
                    <TableCell className="text-orange-600 font-medium">
                      4.7 days
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
