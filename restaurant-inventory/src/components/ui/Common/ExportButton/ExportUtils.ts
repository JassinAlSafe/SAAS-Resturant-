import { ExportFormat } from './AdvancedExportButton';

/**
 * Converts data to CSV format
 */
export function convertToCSV(data: any[], headers?: Record<string, string>): string {
    if (!data.length) return '';

    // Determine headers from the first data item if not provided
    const headerKeys = headers
        ? Object.keys(headers)
        : Object.keys(data[0]);

    const headerValues = headers
        ? Object.values(headers)
        : headerKeys;

    // Create CSV header row
    let csv = headerValues.join(',') + '\n';

    // Add data rows
    data.forEach(item => {
        const row = headerKeys.map(key => {
            const value = item[key];
            // Handle values that contain commas or quotes
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
        csv += row + '\n';
    });

    return csv;
}

/**
 * Creates and triggers a download of a file with the provided data
 */
export function downloadFile(data: string, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Exports data in the specified format
 */
export function exportData(
    data: any[],
    format: ExportFormat,
    filename: string = 'export',
    headers?: Record<string, string>
): void {
    switch (format) {
        case 'csv':
            const csv = convertToCSV(data, headers);
            downloadFile(csv, `${filename}.csv`, 'text/csv');
            break;

        case 'json':
            const json = JSON.stringify(data, null, 2);
            downloadFile(json, `${filename}.json`, 'application/json');
            break;

        case 'text':
            const text = data.map(item => JSON.stringify(item)).join('\n');
            downloadFile(text, `${filename}.txt`, 'text/plain');
            break;

        case 'excel':
            // For Excel, we'll use CSV as a simple alternative
            // In a production app, you might want to use a library like exceljs or xlsx
            const excelCsv = convertToCSV(data, headers);
            downloadFile(excelCsv, `${filename}.csv`, 'text/csv');
            break;

        case 'pdf':
            // PDF generation usually requires a library like jspdf
            // This is a simplified placeholder
            alert('PDF export requires additional libraries. Implement with jspdf or similar.');
            break;

        default:
            console.error(`Unsupported export format: ${format}`);
    }
} 