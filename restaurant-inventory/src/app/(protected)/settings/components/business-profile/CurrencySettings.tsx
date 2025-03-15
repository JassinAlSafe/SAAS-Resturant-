import React from "react";
import { Label } from "@/components/ui/label";
import { FiDollarSign } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";

interface CurrencySettingsProps {
  defaultCurrency: CurrencyCode;
  isLoading: boolean;
  onUpdate: (currency: CurrencyCode) => void;
}

export function CurrencySettings({
  defaultCurrency,
  isLoading,
  onUpdate,
}: CurrencySettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <FiDollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Currency Settings</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Default Currency</Label>
        <div className="flex space-x-2">
          <Select
            value={defaultCurrency}
            onValueChange={(value) => onUpdate(value as CurrencyCode)}
            disabled={isLoading}
          >
            <SelectTrigger id="currency" className="flex-1">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, currency]) => (
                <SelectItem key={code} value={code}>
                  {currency.symbol} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This currency will be used as the default for all inventory items,
          recipes, and reports.
        </p>
      </div>
    </div>
  );
}
