import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FiPercent } from "react-icons/fi";

interface TaxSettingsProps {
  taxRate: number;
  taxEnabled: boolean;
  taxName: string;
  isLoading: boolean;
  onUpdate: (taxSettings: {
    taxRate: number;
    taxEnabled: boolean;
    taxName: string;
  }) => void;
}

export function TaxSettings({
  taxRate,
  taxEnabled,
  taxName,
  isLoading,
  onUpdate,
}: TaxSettingsProps) {
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    if (!isNaN(newRate) && newRate >= 0) {
      onUpdate({ taxRate: newRate, taxEnabled, taxName });
    }
  };

  const handleTaxNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ taxRate, taxEnabled, taxName: e.target.value });
  };

  const handleTaxEnabledChange = (checked: boolean) => {
    onUpdate({ taxRate, taxEnabled: checked, taxName });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <FiPercent className="mr-2 h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Tax Settings</h3>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="tax-enabled"
          checked={taxEnabled}
          onCheckedChange={handleTaxEnabledChange}
          disabled={isLoading}
        />
        <Label htmlFor="tax-enabled">Enable Tax Calculation</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-name">Tax Name</Label>
        <Input
          id="tax-name"
          value={taxName}
          onChange={handleTaxNameChange}
          placeholder="e.g. Sales Tax, VAT, GST"
          disabled={!taxEnabled || isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
        <div className="relative">
          <Input
            id="tax-rate"
            type="number"
            value={taxRate.toString()}
            onChange={handleTaxRateChange}
            min="0"
            step="0.01"
            disabled={!taxEnabled || isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FiPercent className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This tax rate will be applied to sales calculations and reports.
        </p>
      </div>
    </div>
  );
}
