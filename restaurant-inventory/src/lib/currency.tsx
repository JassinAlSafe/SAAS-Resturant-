"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";

// Define available currencies
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "$", name: "Euro" },
  { code: "GBP", symbol: "$", name: "British Pound" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "JPY", symbol: "$", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "$", name: "Chinese Yuan" },
  { code: "INR", symbol: "", name: "Indian Rupee" },
];

// Define the currency context type
interface CurrencyContextType {
  currencySymbol: string;
  currencyCode: string;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

// Create the context with default values
const CurrencyContext = createContext<CurrencyContextType>({
  currencySymbol: "$",
  currencyCode: "USD",
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  isLoading: true,
});

interface CurrencyProviderProps {
  children: ReactNode;
}

// Create a provider component
export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { user } = useAuth();
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the business profile\'s currency
  useEffect(() => {
    async function fetchBusinessProfileCurrency() {
      if (!user?.businessProfileId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/business-profile/${user.businessProfileId}/currency`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.currency) {
            // Set the currency based on the business profile
            if (data.currency === "SEK") {
              setCurrencySymbol("kr");
              setCurrencyCode("SEK");
            } else {
              setCurrencySymbol("$");
              setCurrencyCode(data.currency || "USD");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching currency:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBusinessProfileCurrency();
  }, [user?.businessProfileId]);

  // Format currency based on the current currency code
  const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return `${currencySymbol}0.00`;
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (formatError) {
      // Fallback to basic formatting if Intl.NumberFormat fails
      console.error("Error formatting currency:", formatError);
      return `${currencySymbol}${amount.toFixed(2)}`;
    }
  };

  const value = {
    currencySymbol,
    currencyCode,
    formatCurrency,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Create a hook to use the currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
