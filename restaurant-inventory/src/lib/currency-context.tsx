"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define currency types
export type CurrencyCode = "SEK" | "USD" | "EUR" | "GBP";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

// Available currencies
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to SEK
  const [currency, setCurrency] = useState<Currency>(CURRENCIES.SEK);

  // Load saved currency preference from localStorage on client side
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferredCurrency");
    if (savedCurrency && Object.keys(CURRENCIES).includes(savedCurrency)) {
      setCurrency(CURRENCIES[savedCurrency as CurrencyCode]);
    }
  }, []);

  // Save currency preference when it changes
  useEffect(() => {
    localStorage.setItem("preferredCurrency", currency.code);
  }, [currency]);

  // Format currency with the current symbol
  const formatCurrency = (amount: number): string => {
    // For SEK, the symbol comes after the amount
    if (currency.code === "SEK") {
      return `${amount.toFixed(2)} ${currency.symbol}`;
    }
    // For other currencies, the symbol comes before the amount
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Custom hook to use the currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
