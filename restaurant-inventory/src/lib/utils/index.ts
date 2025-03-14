// Export existing utility functions
export * from './cn';
// Add any other exports from existing utility files

/**
 * Format currency with custom options
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'SEK')
 * @param locale - The locale to use (default: 'sv-SE')
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number,
    currency: string = 'SEK',
    locale: string = 'sv-SE'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};
