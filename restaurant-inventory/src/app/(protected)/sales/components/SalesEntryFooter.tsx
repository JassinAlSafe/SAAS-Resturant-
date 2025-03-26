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
    <div className="px-5 py-5 border-t border-neutral-50 sticky bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white to-white/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-500">Total:</span>
          <span className="text-2xl font-semibold text-orange-600">
            {formatCurrency(total || 0)}
          </span>
        </div>

        <Button
          type="submit"
          disabled={isDisabled || isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          data-testid="submit-sales-entry"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
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
