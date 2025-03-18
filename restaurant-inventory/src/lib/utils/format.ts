/**
 * Formats a number as currency using the user's preferred currency
 * NOTE: This is a server-side utility that doesn't have access to the currency context
 * For client components, use the useCurrency hook instead
 */
export function formatCurrency(value: number): string {
    // Get user currency from local storage or default to SEK
    // This is a fallback only - components should use useCurrency() hook when possible
    try {
        // For SSR/RSC safety - handle case where localStorage is not available
        if (typeof window !== 'undefined') {
            const storedCurrency = localStorage.getItem('userCurrency');
            if (storedCurrency === 'SEK') {
                return new Intl.NumberFormat('sv-SE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(value) + ' kr';
            }
        }
    } catch (error) {
        // Fail silently and use default formatting
        console.error('Error accessing localStorage for currency format:', error);
    }

    // Default to SEK formatting as fallback
    return new Intl.NumberFormat('sv-SE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value) + ' kr';
}