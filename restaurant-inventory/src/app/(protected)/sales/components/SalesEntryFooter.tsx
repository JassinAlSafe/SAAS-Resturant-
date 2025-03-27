"use client";

import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency";
import { Save } from "lucide-react";

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
    <div className="px-5 py-5 border-t border-orange-50 sticky bottom-0 left-0 right-0 z-10 bg-white rounded-b-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-500">Total:</span>
          <span className="text-2xl font-semibold text-orange-600">
            {formatCurrency(total || 0)}
          </span>
        </div>

        <Button
          type="submit"
          disabled={isDisabled || isSubmitting}
          className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-6 py-2.5 text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
          data-testid="submit-sales-entry"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              <span>Save Sales</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
