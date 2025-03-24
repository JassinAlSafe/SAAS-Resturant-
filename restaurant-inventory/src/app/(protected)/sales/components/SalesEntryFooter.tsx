"use client";

import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency";
import { Loader2, Save } from "lucide-react";

interface SalesEntryFooterProps {
  total: number;
  isSubmitting: boolean;
  isDisabled: boolean;
}

export function SalesEntryFooter({
  total,
  isSubmitting,
  isDisabled,
}: SalesEntryFooterProps) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 border-t border-slate-200/80 bg-white sticky bottom-0 left-0 right-0 z-50 shadow-md">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-500">Total Sales</div>
        <div className="text-2xl font-bold text-slate-900">
          {formatCurrency(total || 0)}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isDisabled || isSubmitting}
        className="w-full sm:w-auto px-6 h-10 bg-blue-600 hover:bg-blue-700 transition-colors"
        size="default"
        data-testid="submit-sales-entry"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Sales
          </>
        )}
      </Button>
    </div>
  );
}
