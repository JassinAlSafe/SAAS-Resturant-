import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency?: { symbol: string; code: string }) {
  if (!amount && amount !== 0) return "";

  const symbol = currency?.symbol || "kr";
  const code = currency?.code || "SEK";

  // Use Swedish locale for SEK
  if (code === "SEK") {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
    }).format(amount);
  }

  // Use default formatting for other currencies
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    currencyDisplay: "symbol",
  })
    .format(amount)
    .replace("$", symbol);
}
