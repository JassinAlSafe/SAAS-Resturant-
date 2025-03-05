"use client";

import Card from "@/components/Card";
import { Bar, Pie } from "react-chartjs-2";
import { SalesAnalyticsViewProps } from "../types";
import { SalesMetricCard } from "./SalesMetricCard";
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

  // Handle click on a dish in the pie chart
  const handleDishClick = (event: any, elements: any) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedDishIndex(index);
      setShowDishDetails(true);
    }
  };

  // Handle click on a day in the bar chart
  const handleDayClick = (event: any, elements: any) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedDateIndex(index);
      setShowDayDetails(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards - Group by type */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Sales Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <SalesMetricCard
            title="Total Sales"
            value={formatCurrency(10500)}
            change="+12%"
            positive={true}
            previousValue={formatCurrency(previousPeriodData?.totalSales || 0)}
            tooltip="Total revenue from all sales during the selected period."
          />
          <SalesMetricCard
            title="Average Daily Sales"
            value={formatCurrency(1500)}
            change="+8%"
            positive={true}
            previousValue={formatCurrency(
              previousPeriodData?.avgDailySales || 0
            )}
            tooltip="Average daily revenue calculated as Total Sales ÷ Number of Days."
          />
          <SalesMetricCard
            title="Total Orders"
            value="420"
            change="+15%"
            positive={true}
            previousValue={previousPeriodData?.totalOrders.toString() || "0"}
            tooltip="Total number of orders processed during the selected period."
          />
          <SalesMetricCard
            title="Average Order Value"
            value={formatCurrency(25)}
            change="-3%"
            positive={false}
            previousValue={formatCurrency(
              previousPeriodData?.avgOrderValue || 0
            )}
            tooltip="Average value per order calculated as Total Sales ÷ Total Orders."
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
          <h3 className="text-sm font-medium mb-4">Daily Sales</h3>
          <div className="h-[280px] md:h-[320px]">
            <Bar
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: handleDayClick,
                plugins: {
                  legend: {
                    position: "top" as const,
                    display: true,
                    labels: {
                      boxWidth: 12,
                      font: {
                        size: 11,
                      },
                      usePointStyle: true,
                      pointStyle: "circle",
                    },
                  },
                  title: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `Sales: ${formatCurrency(context.parsed.y)}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        size: 10,
                      },
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                  y: {
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      font: {
                        size: 10,
                      },
                      callback: function (value) {
                        return formatCurrency(value as number);
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click on a bar to see details for that day
          </p>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
          <h3 className="text-sm font-medium mb-4">Top Selling Dishes</h3>
          <div className="h-[280px] md:h-[320px] flex items-center justify-center">
            <div className="w-full max-w-[240px]">
              <Pie
                data={topDishesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  onClick: handleDishClick,
                  plugins: {
                    legend: {
                      position: "bottom" as const,
                      display: true,
                      labels: {
                        boxWidth: 12,
                        font: {
                          size: 11,
                        },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: "circle",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const value = context.parsed;
                          const total = context.dataset.data.reduce(
                            (a: number, b: number) => a + b,
                            0
                          );
                          const percentage = Math.round((value * 100) / total);
                          return `${context.label}: ${percentage}% (${value} orders)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click on a slice to see dish details
          </p>
        </div>
      </div>

      {/* Dish Details Dialog */}
      <Dialog open={showDishDetails} onOpenChange={setShowDishDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDishIndex !== null &&
                topDishesData.labels[selectedDishIndex]}{" "}
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
                  {salesData.labels.slice(0, 5).map((date, i) => (
                    <TableRow key={i}>
                      <TableCell>{date}</TableCell>
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
                salesData.labels[selectedDateIndex]}{" "}
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
                      salesData.datasets[0].data[selectedDateIndex]
                    )}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="text-lg font-medium">
                    {Math.round(
                      salesData.datasets[0].data[selectedDateIndex] / 25
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
                  {topDishesData.labels.map((dish, i) => (
                    <TableRow key={i}>
                      <TableCell>{dish}</TableCell>
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
