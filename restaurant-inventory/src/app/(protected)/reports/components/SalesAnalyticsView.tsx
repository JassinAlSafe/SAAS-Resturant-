"use client";

import Card from "@/components/Card";
import { Bar, Pie } from "react-chartjs-2";
import { SalesAnalyticsViewProps } from "../types";
import { useState } from "react";
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

export const SalesAnalyticsView = ({
  salesData,
  topDishesData,
  formatCurrency,
  previousPeriodData,
}: SalesAnalyticsViewProps) => {
  const [selectedDishIndex, setSelectedDishIndex] = useState<number | null>(
    null
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null
  );
  const [showDishDetails, setShowDishDetails] = useState(false);
  const [showDayDetails, setShowDayDetails] = useState(false);

  // Check if we have data to display
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

  // Calculate metrics with proper type safety
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

  // Type-safe event handlers
  const handleDishClick = (_event: unknown, elements: { index: number }[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedDishIndex(index);
      setShowDishDetails(true);
    }
  };

  const handleDayClick = (_event: unknown, elements: { index: number }[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedDateIndex(index);
      setShowDayDetails(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. {formatCurrency(previousPeriodData?.totalSales || 0)} last
              period
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Daily Sales
            </CardTitle>
            <div className="text-2xl font-bold">
              {formatCurrency(avgDailySales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. {formatCurrency(previousPeriodData?.avgDailySales || 0)} last
              period
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. {previousPeriodData?.totalOrders.toString() || "0"} last
              period
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order Value
            </CardTitle>
            <div className="text-2xl font-bold">
              {formatCurrency(avgOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. {formatCurrency(previousPeriodData?.avgOrderValue || 0)} last
              period
            </p>
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

      {/* Dish Details Dialog */}
      <Dialog open={showDishDetails} onOpenChange={setShowDishDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDishIndex !== null &&
                (topDishesData.labels?.[selectedDishIndex] as string)}{" "}
              Details
            </DialogTitle>
          </DialogHeader>
          {selectedDishIndex !== null && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-lg font-medium">
                    {topDishesData.datasets[0].data[selectedDishIndex]}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">% of Sales</p>
                  <p className="text-lg font-medium">
                    {Math.round(
                      (topDishesData.datasets[0].data[selectedDishIndex] *
                        100) /
                        topDishesData.datasets[0].data.reduce(
                          (a, b) => a + b,
                          0
                        )
                    )}
                    %
                  </p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sample data - would be real data in production */}
                  {(salesData.labels ?? []).slice(0, 5).map((date, i) => (
                    <TableRow key={i}>
                      <TableCell>{date as string}</TableCell>
                      <TableCell>
                        {Math.round(Math.random() * 10) + 1}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Math.random() * 200 + 50)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDishDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Details Dialog */}
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
                  {/* Sample data - would be real data in production */}
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
    </div>
  );
};
