"use client";

import { Line } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryUsageViewProps } from "../types";
import { InventoryRow } from "./InventoryRow";
import { useEffect, useState } from "react";
import { ChartData } from "chart.js";

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
        <h3 className="text-sm font-medium mb-4">Ingredient Usage Trends</h3>
        <div className="h-[280px] md:h-[320px]">
          {!hasData && (
            <div className="h-full flex items-center justify-center flex-col">
              <p className="text-muted-foreground">
                No data available for the selected period
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try selecting a different date range
              </p>
            </div>
          )}

          {hasData && (
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
                <InventoryRow
                  name="Tomatoes"
                  stock="2 kg"
                  usage="5.5 kg"
                  depletion="2.5 days"
                  depleted={true}
                />
                <InventoryRow
                  name="Chicken Breast"
                  stock="1.5 kg"
                  usage="4.1 kg"
                  depletion="2.6 days"
                  depleted={true}
                />
                <InventoryRow
                  name="Mozzarella Cheese"
                  stock="0.5 kg"
                  usage="2.8 kg"
                  depletion="1.3 days"
                  depleted={true}
                />
                <InventoryRow
                  name="Flour"
                  stock="8 kg"
                  usage="8.5 kg"
                  depletion="6.6 days"
                  depleted={false}
                  warning={true}
                />
                <InventoryRow
                  name="Eggs"
                  stock="24 pcs"
                  usage="36 pcs"
                  depletion="4.7 days"
                  depleted={false}
                  warning={true}
                />
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
