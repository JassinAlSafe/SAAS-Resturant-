"use client";

import { useState, useCallback } from "react";
import Card from "@/components/Card";
import { Bar, Pie } from "react-chartjs-2";
import { SalesAnalyticsViewProps } from "../types"; // Remove DateRange import from here
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "./EmptyState";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, TrendingDown, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DishDetailsModal } from "./DishDetailsModal";

export const SalesAnalyticsView = ({
  salesData,
  topDishesData,
  formatCurrency,
  previousPeriodData,
  getPercentageChange,
  dateRange,
}: SalesAnalyticsViewProps) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null
  );
  const [showDishDetails, setShowDishDetails] = useState(false);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dishDetails, setDishDetails] = useState({
    dishId: "",
    dishName: "",
    quantity: 0,
    revenue: 0,
    cost: 0,
    profit: 0,
    ingredients: [] as Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
    }>,
  });

  const handleDishClick = useCallback(
    async (_event: unknown, elements: { index: number }[]) => {
      if (elements.length === 0 || !topDishesData.labels) return;

      const index = elements[0].index;
      const dishName = topDishesData.labels[index] as string;
      if (!dishName || dishName === "Other") return;

      setIsLoading(true);

      try {
        const mockDishDetails = {
          dishId: `dish-${index}`,
          dishName,
          quantity: Math.floor(Math.random() * 100) + 20,
          revenue: Math.random() * 2000 + 500,
          cost: Math.random() * 800 + 200,
          profit: Math.random() * 1200 + 300,
          ingredients: [
            { id: "ing-1", name: "Tomatoes", quantity: 0.2, unit: "kg" },
            { id: "ing-2", name: "Onions", quantity: 0.1, unit: "kg" },
            { id: "ing-3", name: "Chicken", quantity: 0.3, unit: "kg" },
          ],
        };

        setDishDetails(mockDishDetails);
        setShowDishDetails(true);
      } catch (error) {
        console.error("Error fetching dish details:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [topDishesData.labels]
  );

  const handleDayClick = useCallback(
    (_event: unknown, elements: { index: number }[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedDateIndex(index);
        setShowDayDetails(true);
      }
    },
    []
  );

  const hasData = salesData?.datasets?.[0]?.data?.length > 0;
  const hasDishData = (topDishesData?.labels?.length ?? 0) > 0;

  if (!hasData && !hasDishData) {
    return (
      <EmptyState
        title="No sales data available"
        description="There are no sales recorded for the selected date range. Try selecting a different period or add some sales."
      />
    );
  }

  const totalSales = salesData.datasets[0].data.reduce(
    (a, b) => (typeof a === "number" && typeof b === "number" ? a + b : 0),
    0
  ) as number;

  const totalOrders = salesData.datasets[0].data.reduce(
    (a, b) =>
      typeof a === "number" && typeof b === "number"
        ? a + Math.round((b as number) / 25)
        : 0,
    0
  ) as number;

  const avgDailySales = totalSales / (salesData.labels?.length ?? 1);
  const avgOrderValue = totalSales / (totalOrders || 1);

  const periodLabel =
    dateRange && dateRange.from && dateRange.to
      ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(
          dateRange.to,
          "MMM d, yyyy"
        )}`
      : "selected period";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Total Sales
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sum of all sales in the selected period</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <div className="flex items-center mt-1 text-xs">
              {previousPeriodData?.totalSales !== undefined && (
                <>
                  vs. {formatCurrency(previousPeriodData.totalSales)} last
                  period
                  <span
                    className={`ml-2 flex items-center ${
                      getPercentageChange(
                        totalSales,
                        previousPeriodData.totalSales
                      ) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getPercentageChange(
                      totalSales,
                      previousPeriodData.totalSales
                    ) >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(
                      getPercentageChange(
                        totalSales,
                        previousPeriodData.totalSales
                      )
                    )}
                    %
                  </span>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Average Daily Sales
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average sales per day in the selected period</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <div className="text-2xl font-bold">
              {formatCurrency(avgDailySales)}
            </div>
            <div className="flex items-center mt-1 text-xs">
              {previousPeriodData?.avgDailySales !== undefined && (
                <>
                  vs. {formatCurrency(previousPeriodData.avgDailySales)} last
                  period
                  <span
                    className={`ml-2 flex items-center ${
                      getPercentageChange(
                        avgDailySales,
                        previousPeriodData.avgDailySales
                      ) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getPercentageChange(
                      avgDailySales,
                      previousPeriodData.avgDailySales
                    ) >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(
                      getPercentageChange(
                        avgDailySales,
                        previousPeriodData.avgDailySales
                      )
                    )}
                    %
                  </span>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Total Orders
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of orders in the selected period</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center mt-1 text-xs">
              {previousPeriodData?.totalOrders !== undefined && (
                <>
                  vs. {previousPeriodData.totalOrders.toString() || "0"} last
                  period
                  <span
                    className={`ml-2 flex items-center ${
                      getPercentageChange(
                        totalOrders,
                        previousPeriodData.totalOrders
                      ) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getPercentageChange(
                      totalOrders,
                      previousPeriodData.totalOrders
                    ) >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(
                      getPercentageChange(
                        totalOrders,
                        previousPeriodData.totalOrders
                      )
                    )}
                    %
                  </span>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Average Order Value
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average revenue per order</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <div className="text-2xl font-bold">
              {formatCurrency(avgOrderValue)}
            </div>
            <div className="flex items-center mt-1 text-xs">
              {previousPeriodData?.avgOrderValue !== undefined && (
                <>
                  vs. {formatCurrency(previousPeriodData.avgOrderValue)} last
                  period
                  <span
                    className={`ml-2 flex items-center ${
                      getPercentageChange(
                        avgOrderValue,
                        previousPeriodData.avgOrderValue
                      ) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getPercentageChange(
                      avgOrderValue,
                      previousPeriodData.avgOrderValue
                    ) >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(
                      getPercentageChange(
                        avgOrderValue,
                        previousPeriodData.avgOrderValue
                      )
                    )}
                    %
                  </span>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Daily Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="h-[350px]">
                <Bar
                  data={salesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: handleDayClick,
                    plugins: {
                      legend: {
                        position: "top",
                        align: "end",
                        labels: {
                          boxWidth: 8,
                          usePointStyle: true,
                          pointStyle: "circle",
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `${context.dataset.label}: ${formatCurrency(
                              context.parsed.y
                            )}`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatCurrency(value as number),
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <EmptyState
                title="No daily sales data"
                description="There are no sales recorded for this period."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Top Selling Dishes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasDishData ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="w-full max-w-[240px]">
                  <Pie
                    data={topDishesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      onClick: handleDishClick,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            boxWidth: 8,
                            usePointStyle: true,
                            pointStyle: "circle",
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) =>
                              `${context.label}: ${context.raw}% of sales`,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                title="No dish data"
                description="There are no dishes sold in this period."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDateIndex !== null &&
                (salesData.labels?.[selectedDateIndex] as string)}{" "}
              Sales
            </DialogTitle>
          </DialogHeader>
          {selectedDateIndex !== null && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(
                      (salesData.datasets[0].data[selectedDateIndex] ??
                        0) as number
                    )}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="text-lg font-medium">
                    {Math.round(
                      ((salesData.datasets[0].data[selectedDateIndex] ??
                        0) as number) / 25
                    )}
                  </p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(topDishesData.labels ?? []).map((dish, i) => (
                    <TableRow key={i}>
                      <TableCell>{dish as string}</TableCell>
                      <TableCell>{Math.round(Math.random() * 8) + 1}</TableCell>
                      <TableCell>
                        {formatCurrency(Math.random() * 150 + 50)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDayDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DishDetailsModal
        isOpen={showDishDetails}
        onClose={() => setShowDishDetails(false)}
        dishName={dishDetails.dishName}
        dishId={dishDetails.dishId}
        quantity={dishDetails.quantity}
        revenue={dishDetails.revenue}
        cost={dishDetails.cost}
        profit={dishDetails.profit}
        ingredients={dishDetails.ingredients}
        formatCurrency={formatCurrency}
        isLoading={isLoading}
        periodLabel={periodLabel}
      />
    </div>
  );
};
