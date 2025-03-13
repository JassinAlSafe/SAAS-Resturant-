"use client";

import { Line } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { InventoryUsageViewProps } from "../types";
import { InventoryRow } from "./InventoryRow";
import { useEffect, useState } from "react";
import { ChartData } from "chart.js";
import { ErrorBoundary } from "@/components/error-boundary";

// Default empty chart data to use as fallback
const emptyChartData: ChartData<"line"> = {
  labels: [],
  datasets: [
    {
      label: "No Data",
      data: [],
      borderColor: "rgb(200, 200, 200)",
      backgroundColor: "rgba(200, 200, 200, 0.5)",
    },
  ],
};

export const InventoryUsageView = ({
  inventoryUsageData,
  onRefresh,
}: InventoryUsageViewProps) => {
  const [chartData, setChartData] = useState<ChartData<"line">>(emptyChartData);

  // Ensure we always have valid chart data
  useEffect(() => {
    if (
      inventoryUsageData &&
      inventoryUsageData.labels &&
      inventoryUsageData.datasets
    ) {
      setChartData(inventoryUsageData);
    } else {
      setChartData(emptyChartData);
    }
  }, [inventoryUsageData]);

  // Check if we have real data or not
  const hasData = chartData.labels && chartData.labels.length > 0;

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Ingredient Usage Trends</h3>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh data</span>
            </Button>
          )}
        </div>
        <div className="h-[280px] md:h-[320px]">
          <ErrorBoundary
            fallback={
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Error loading chart data
                </p>
              </div>
            }
          >
            {!hasData ? (
              <div className="h-full flex items-center justify-center flex-col">
                <p className="text-muted-foreground">
                  No data available for the selected period
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try selecting a different date range
                </p>
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="mt-4"
                  >
                    Refresh Data
                  </Button>
                )}
              </div>
            ) : (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                      display: true,
                      labels: {
                        boxWidth: 12,
                        padding: 10,
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
                      },
                    },
                  },
                }}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
        <h3 className="text-sm font-medium mb-4">Inventory Summary</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] md:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%] text-xs md:text-sm">
                    Ingredient
                  </TableHead>
                  <TableHead className="w-[20%] text-xs md:text-sm">
                    Current Stock
                  </TableHead>
                  <TableHead className="w-[25%] text-xs md:text-sm">
                    Usage (Last 7 Days)
                  </TableHead>
                  <TableHead className="w-[25%] text-xs md:text-sm">
                    Projected Depletion
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hasData ? (
                  <TableRow>
                    <TableHead
                      colSpan={4}
                      className="text-center h-32 text-muted-foreground"
                    >
                      No inventory data available
                    </TableHead>
                  </TableRow>
                ) : (
                  inventoryUsageData.inventory?.map((item) => (
                    <InventoryRow
                      key={item.name}
                      name={item.name}
                      stock={item.stock}
                      usage={item.usage}
                      depletion={item.depletion}
                      depleted={item.depleted}
                      warning={item.warning}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
