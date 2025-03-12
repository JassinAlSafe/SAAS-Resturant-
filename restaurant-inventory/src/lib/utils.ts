import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency?: { symbol: string; code: string }) {
  if (!amount && amount !== 0) return "";

  const symbol = currency?.symbol || "$";
  const code = currency?.code || "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    currencyDisplay: "symbol",
  })
    .format(amount)
    .replace("$", symbol);
}
