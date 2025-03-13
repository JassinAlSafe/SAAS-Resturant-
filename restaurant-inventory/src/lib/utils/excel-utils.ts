import { format } from 'date-fns';
import ExcelJS from 'exceljs';

interface SalesExportItem {
    date: string;
    dish_name: string;
    quantity: number;
    price: number;
    total: number;
    category: string;
}

interface SalesExportData {
    id: string;
    date: string;
    items: SalesExportItem[];
    total: number;
}

/**
 * Generates and downloads an Excel file from sales data
 * @param salesData The prepared sales data
 * @param filename The name of the file to be downloaded
 * @param formatCurrency A function to format currency values
 */
export function generateSalesExcel(
    salesData: SalesExportData[],
    filename = 'sales-report',
    formatCurrency: (value: number) => string = (value) =>
        new Intl.NumberFormat("sv-SE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value) + " kr"
) {
    try {
        // Validate formatCurrency is a function
        if (typeof formatCurrency !== 'function') {
            console.warn('formatCurrency is not a function, using default formatter');
            formatCurrency = (value) =>
                new Intl.NumberFormat("sv-SE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(value) + " kr";
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sales Data");

        // Define columns
        worksheet.columns = [
            { header: "Date", key: "date", width: 15 },
            { header: "Item", key: "dishName", width: 30 },
            { header: "Category", key: "category", width: 20 },
            { header: "Quantity", key: "quantity", width: 10 },
            { header: "Price", key: "price", width: 15 },
            { header: "Total", key: "total", width: 15 },
        ];

        // Add data rows
        salesData.forEach(sale => {
            sale.items.forEach(item => {
                worksheet.addRow({
                    date: format(new Date(sale.date), "yyyy-MM-dd"),
                    dishName: item.dish_name,
                    category: item.category || "Uncategorized",
                    quantity: item.quantity,
                    price: formatCurrency(item.price),
                    total: formatCurrency(item.total),
                });
            });
        });

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" },
        };

        // Auto-filter
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: worksheet.columns.length },
        };

        // Generate and download the file
        workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
        });
    } catch (error) {
        console.error('Error generating Excel file:', error);
        throw error;
    }
} 