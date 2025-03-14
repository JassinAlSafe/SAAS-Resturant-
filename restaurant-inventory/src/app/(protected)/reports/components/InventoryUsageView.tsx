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
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

// Define a type for API response
interface SeedDataResponse {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

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
  const [isSeeding, setIsSeeding] = useState(false);
  const { isAuthenticated } = useUser();

  // Validate and set chart data
  useEffect(() => {
    if (
      inventoryUsageData?.labels?.length > 0 &&
      inventoryUsageData?.datasets?.length > 0 &&
      inventoryUsageData?.datasets?.every(
        (dataset) => dataset.data?.length === inventoryUsageData.labels.length
      )
    ) {
      setChartData(inventoryUsageData);
    } else {
      setChartData(emptyChartData);
    }
  }, [inventoryUsageData]);

  // Check if we have real data or not
  const hasData = Boolean(
    inventoryUsageData?.labels?.length > 0 &&
      inventoryUsageData?.datasets?.length > 0 &&
      inventoryUsageData?.datasets?.some((dataset) =>
        dataset.data?.some((value) => value > 0)
      )
  );
  const hasInventoryData = Boolean(inventoryUsageData?.inventory?.length);

  const handleSeedData = async () => {
    console.log("Attempting to seed data. Auth state:", { isAuthenticated });

    if (!isAuthenticated) {
      console.log("User not authenticated, showing error");
      toast.error("Please log in to add test data");
      return;
    }

    try {
      setIsSeeding(true);
      console.log("Starting data seeding process via API...");

      // Show loading toast
      toast.loading("Adding test data...", { id: "seeding-toast" });

      // Call the API route instead of the client function
      const response = await fetch("/api/seed-test-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for sending cookies
      });

      console.log("API response status:", response.status);

      const result = await response.json();
      console.log("API seed result:", result);

      // Dismiss loading toast
      toast.dismiss("seeding-toast");

      if (result.success) {
        toast.success("Test data added successfully");
        if (onRefresh) {
          console.log("Triggering refresh after successful seeding");
          await onRefresh();
        }
      } else {
        console.error("Seeding failed:", result.error);

        // Show a more user-friendly error message
        const errorMessage = result.error || "Failed to add test data";
        const isAuthError =
          errorMessage.toLowerCase().includes("auth") ||
          errorMessage.toLowerCase().includes("session");

        if (isAuthError) {
          toast.error(
            "Unable to verify your session. Please refresh the page and try again."
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error in handleSeedData:", error);

      // Dismiss loading toast
      toast.dismiss("seeding-toast");

      // Show a user-friendly error message without using the errorMessage variable
      toast.error("Failed to connect to the server. Please try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  console.log("Render state:", {
    isAuthenticated,
    isSeeding,
    hasInventoryData,
    hasData,
  });

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Inventory Usage Analytics</h2>
        <div className="flex items-center gap-2">
          {(!hasInventoryData || !inventoryUsageData?.inventory?.length) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              disabled={isSeeding || !isAuthenticated}
              className="flex items-center gap-2"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Adding Test Data...
                </>
              ) : (
                <>Add Test Data</>
              )}
            </Button>
          )}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Refresh clicked");
                onRefresh();
              }}
              disabled={isSeeding}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Ingredient Usage Trends</h3>
        </div>
        <div className="h-[280px] md:h-[320px]">
          <ErrorBoundary
            fallback={({ error, reset }) => (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Error loading chart data: {error.message}
                  </p>
                  <Button variant="outline" size="sm" onClick={reset}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          >
            {!hasData ? (
              <div className="h-full flex items-center justify-center flex-col">
                <p className="text-muted-foreground">
                  No usage data available for the selected period
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This could be because:
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside mt-2">
                  <li>No sales were recorded in this period</li>
                  <li>No ingredients are linked to dishes</li>
                  <li>The selected date range is invalid</li>
                </ul>
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
                {!hasInventoryData ? (
                  <TableRow>
                    <TableHead
                      colSpan={4}
                      className="text-center h-32 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <p>No inventory data available</p>
                        <p className="text-xs">
                          Check that you have ingredients and sales data in your
                          system
                        </p>
                      </div>
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
