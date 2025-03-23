/**
 * Formats a number as currency with the appropriate currency symbol based on user\'s business profile
 */
export async function formatCurrencyAsync(value: number): Promise<string> {
    // Dynamically import to avoid circular dependencies
    const { getBusinessProfileCurrency } = await import('@/lib/services/dashboard/profile-service');
    
    // Get the currency from the business profile
    const currency = await getBusinessProfileCurrency();
    
    // Use Intl.NumberFormat for locale formatting with the correct currency
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(value);
}

/**
 * Synchronous version that uses a cached or default currency
 * This is used when we can\'t use async functions (like in component rendering)
 */
let cachedCurrency: string | null = null;

// Initialize the cached currency
import('@/lib/services/dashboard/profile-service').then(({ getBusinessProfileCurrency }) => {
    getBusinessProfileCurrency().then(currency => {
        cachedCurrency = currency;
        console.log(`Cached currency set to: ${currency}`);
    });
});

export function formatCurrency(value: number): string {
    // Use the cached currency or default to USD if not available yet
    const currency = cachedCurrency || 'USD';
    
    // Use Intl.NumberFormat for locale formatting
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(value);
}