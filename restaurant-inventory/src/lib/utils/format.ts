/**
 * Formats a number as currency with dollar sign and two decimal places
 */
export function formatCurrency(value: number): string {
    // Use Intl.NumberFormat for locale formatting
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
}