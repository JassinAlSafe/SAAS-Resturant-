import { exportToExcel } from "@/lib/utils/export";
import { toast } from "sonner";
import { SalesData, TopDishesData, InventoryUsageData, DateRangeType } from "../types";

// Define a more specific type for Excel data rows
type SalesReportRow = {
    Date: string;
    Revenue: string;
    Orders: string | number;
    "Average Order": string;
};

type TopDishesRow = {
    Dish: string;
    Percentage: string;
};

type InventoryReportRow = {
    Date: string;
    [ingredientName: string]: string;
};

/**
 * Export sales report data to Excel
 */
export const exportSalesReport = async (
    salesData: SalesData,
    topDishesData: TopDishesData,
    dateRange: DateRangeType,
    formatCurrency: (value: number) => string
) => {
    try {
        // Format data for export based on the current tab and date range
        const salesReportData: SalesReportRow[] = [
            {
                Date: "Header Row",
                Revenue: "Values in your currency",
                Orders: "Count",
                "Average Order": "Values in your currency",
            },
            ...salesData.labels.map((date, index) => ({
                Date: date as string,
                Revenue: formatCurrency(salesData.datasets[0].data[index] as number),
                Orders: Math.floor((salesData.datasets[0].data[index] as number) / 25), // Approximate order count
                "Average Order": formatCurrency(
                    (salesData.datasets[0].data[index] as number) /
                    Math.floor((salesData.datasets[0].data[index] as number) / 25)
                ),
            })),
        ];

        // Add top dishes data
        const topDishesRows: TopDishesRow[] = [
            { Dish: "Top Dishes", Percentage: "% of Sales" },
            ...topDishesData.labels.map((dish, index) => ({
                Dish: dish as string,
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
            `Sales Report - ${dateRange === "week"
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

/**
 * Export inventory report data to Excel
 */
export const exportInventoryReport = async (
    inventoryUsageData: InventoryUsageData,
    dateRange: DateRangeType
) => {
    try {
        // Format data for export based on inventory usage
        const inventoryReportData: InventoryReportRow[] = [
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
                const rowData: Record<string, string> = { Date: date as string };

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
            `Inventory Usage - ${dateRange === "week"
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