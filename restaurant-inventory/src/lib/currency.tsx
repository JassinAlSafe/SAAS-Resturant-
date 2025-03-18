"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Currency types and constants
export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD"
  | "SEK";

export interface Currency {
  name: string;
  symbol: string;
  code: CurrencyCode;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { name: "US Dollar", symbol: "$", code: "USD" },
  EUR: { name: "Euro", symbol: "€", code: "EUR" },
  GBP: { name: "British Pound", symbol: "£", code: "GBP" },
  JPY: { name: "Japanese Yen", symbol: "¥", code: "JPY" },
  CAD: { name: "Canadian Dollar", symbol: "C$", code: "CAD" },
  AUD: { name: "Australian Dollar", symbol: "A$", code: "AUD" },
  SEK: { name: "Swedish Krona", symbol: "kr", code: "SEK" },
};

// Storage key for localStorage
const CURRENCY_STORAGE_KEY = "userCurrency";

// Currency context
interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

// Currency provider component
interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: CurrencyCode;
}

export function CurrencyProvider({
  children,
  defaultCurrency = "SEK", // Changed default to SEK
}: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>(
    CURRENCIES[defaultCurrency]
  );

  // Load the saved currency from localStorage on mount
  useEffect(() => {
    try {
      const savedCurrency =
        typeof window !== "undefined"
          ? localStorage.getItem(CURRENCY_STORAGE_KEY)
          : null;

      if (savedCurrency && Object.keys(CURRENCIES).includes(savedCurrency)) {
        setCurrencyState(CURRENCIES[savedCurrency as CurrencyCode]);
      } else if (defaultCurrency && defaultCurrency !== currency.code) {
        // If no saved preference but there's a default that's different from current
        setCurrencyState(CURRENCIES[defaultCurrency]);
      }
    } catch (error) {
      console.error("Error loading currency preference:", error);
    }
  }, [defaultCurrency]);

  // Save currency changes to localStorage
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency.code);
      }
    } catch (error) {
      console.error("Error saving currency preference:", error);
    }
  };

  // Format a number to a currency string with the current currency
  const formatCurrency = (amount: number): string => {
    if (!amount && amount !== 0) return "";

    // Special handling for SEK
    if (currency.code === "SEK") {
      return (
        new Intl.NumberFormat("sv-SE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount) + " kr"
      );
    }

    // Default handling for other currencies
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.code === "JPY" ? 0 : 2,
      maximumFractionDigits: currency.code === "JPY" ? 0 : 2,
    }).format(amount);
  };

  const value = {
    currency,
    setCurrency,
    formatCurrency,
    availableCurrencies: Object.values(CURRENCIES),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook for using the currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);

  // Create a default implementation for when context is unavailable
  const defaultImplementation: CurrencyContextType = {
    currency: CURRENCIES.SEK,
    setCurrency: () => console.warn("setCurrency called outside provider"),
    formatCurrency: (amount: number) => {
      if (!amount && amount !== 0) return "";
      return (
        new Intl.NumberFormat("sv-SE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount) + " kr"
      );
    },
    availableCurrencies: Object.values(CURRENCIES),
  };

  // Return the context if available, otherwise fallback to default implementation
  return context || defaultImplementation;
}
