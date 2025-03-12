import { createContext, useContext, useState, ReactNode } from "react";
import { Currency, CurrencyCode } from "./currency-context";
import { CURRENCIES } from "./currency-constants";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES.USD,
  setCurrency: () => {},
  formatCurrency: (amount: number) => `${amount.toFixed(2)} kr`, // Default formatter for SEK
});

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrency: CurrencyCode;
}

export const CurrencyProvider = ({
  children,
  defaultCurrency,
}: CurrencyProviderProps) => {
  const [currency, setCurrency] = useState<Currency>(
    CURRENCIES[defaultCurrency]
  );

  const formatCurrency = (amount: number): string => {
    // Special handling for SEK to ensure correct format
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
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
