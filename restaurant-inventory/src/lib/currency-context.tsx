"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface CurrencyContextProps {
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Standardized to Swedish Krona
  const formatCurrency = (amount: number): string => {
    return (
      new Intl.NumberFormat("sv-SE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + " kr"
    );
  };

  return (
    <CurrencyContext.Provider value={{ formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
