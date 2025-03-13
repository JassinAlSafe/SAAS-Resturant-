import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

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
 */
export const generateSalesExcel = (
    salesData: SalesExportData[],
    filename = 'sales-report'
): void => {
    try {
        // Create a flat structure for Excel export
        const flatData: any[] = [];

        // Add a header row with summary data
        flatData.push({
            'Date Range': `${salesData[0]?.date || ''} to ${salesData[salesData.length - 1]?.date || ''}`,
            'Total Sales': `$${salesData.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}`,
            'Total Orders': salesData.length
        });

        // Add a blank row
        flatData.push({});

        // Add individual sales items
        salesData.forEach(sale => {
            sale.items.forEach(item => {
                flatData.push({
                    'Date': new Date(item.date).toLocaleDateString(),
                    'Category': item.category,
                    'Item': item.dish_name,
                    'Quantity': item.quantity,
                    'Price': `$${item.price.toFixed(2)}`,
                    'Total': `$${item.total.toFixed(2)}`
                });
            });
        });

        // Create summary sheet data
        const summaryData: any[] = [];

        // Add total by category
        const categoryTotals = salesData.flatMap(s => s.items)
            .reduce((acc, item) => {
                const category = item.category;
                if (!acc[category]) {
                    acc[category] = {
                        totalSales: 0,
                        totalQuantity: 0
                    };
                }
                acc[category].totalSales += item.total;
                acc[category].totalQuantity += item.quantity;
                return acc;
            }, {} as Record<string, { totalSales: number; totalQuantity: number }>);

        summaryData.push({ 'Category Summary': '' });
        summaryData.push({ 'Category': 'Total Sales', 'Quantity': 'Total Items' });

        Object.entries(categoryTotals).forEach(([category, data]) => {
            summaryData.push({
                'Category': category,
                'Total Sales': `$${data.totalSales.toFixed(2)}`,
                'Total Items': data.totalQuantity
            });
        });

        // Add total by date
        summaryData.push({});
        summaryData.push({ 'Daily Summary': '' });
        summaryData.push({ 'Date': 'Total Sales', 'Orders': 'Items Sold' });

        const dateTotals = salesData.reduce((acc, sale) => {
            const date = sale.date;
            if (!acc[date]) {
                acc[date] = {
                    totalSales: 0,
                    totalOrders: 0,
                    totalItems: 0
                };
            }
            acc[date].totalSales += sale.total;
            acc[date].totalOrders += 1;
            acc[date].totalItems += sale.items.reduce((sum, item) => sum + item.quantity, 0);
            return acc;
        }, {} as Record<string, { totalSales: number; totalOrders: number; totalItems: number }>);

        Object.entries(dateTotals).forEach(([date, data]) => {
            summaryData.push({
                'Date': new Date(date).toLocaleDateString(),
                'Total Sales': `$${data.totalSales.toFixed(2)}`,
                'Orders': data.totalOrders,
                'Items Sold': data.totalItems
            });
        });

        // Create workbook with multiple sheets
        const wb = XLSX.utils.book_new();

        // Add detailed transactions sheet
        const ws = XLSX.utils.json_to_sheet(flatData);
        XLSX.utils.book_append_sheet(wb, ws, 'Sales Transactions');

        // Add summary sheet
        const summarySh = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySh, 'Summary');

        // Generate the file and trigger download
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });

        // Use current date in filename if not provided
        const dateStr = new Date().toISOString().split('T')[0];
        saveAs(data, `${filename}-${dateStr}.xlsx`);
    } catch (error) {
        console.error('Error generating Excel file:', error);
        throw error;
    }
}; 