import { useState, useEffect } from 'react';
import { getBusinessProfileCurrency } from '@/lib/services/dashboard/profile-service';

interface CurrencyHookReturn {
  formatCurrency: (value: number) => string;
  currency: string;
  currencySymbol: string;
  isLoading: boolean;
}

/**
 * Custom hook for currency formatting based on the user\'s business profile settings
 */
export function useCurrency(): CurrencyHookReturn {
  const [currency, setCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get the currency symbol based on the currency code
  const getCurrencySymbol = (currencyCode: string): string => {
    try {
      // Create a formatter with the currency code
      const formatter = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
      });
      
      // Extract just the symbol
      const parts = formatter.formatToParts(0);
      const symbolPart = parts.find(part => part.type === 'currency');
      return symbolPart?.value || currencyCode;
    } catch (error) {
      console.error(`Error getting symbol for ${currencyCode}:`, error);
      return currencyCode;
    }
  };

  // Format a number as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Load the currency from the business profile
  useEffect(() => {
    let isMounted = true;
    
    const loadCurrency = async () => {
      try {
        setIsLoading(true);
        const profileCurrency = await getBusinessProfileCurrency();
        
        if (isMounted) {
          setCurrency(profileCurrency);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading currency:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCurrency();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    formatCurrency,
    currency,
    currencySymbol: getCurrencySymbol(currency),
    isLoading,
  };
}
