import { createContext, useContext, useState, ReactNode } from "react";
import { Currency, CurrencyCode } from "./currency-context";
import { CURRENCIES } from "./currency-constants";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES.USD,
  setCurrency: () => {},
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
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
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
