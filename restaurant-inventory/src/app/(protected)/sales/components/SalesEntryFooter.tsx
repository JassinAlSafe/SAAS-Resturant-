"use client";

import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency";
import { Loader2 } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-2 border-t bg-muted/10 sticky bottom-0 z-10">
      <div className="text-lg font-semibold flex items-center">
        Total:{" "}
        <span className="ml-2 text-xl font-bold text-primary">
          {formatCurrency(total || 0)}
        </span>
      </div>
      <Button
        type="submit"
        disabled={isDisabled || isSubmitting}
        className="w-full sm:w-auto min-w-[150px]"
        size="lg"
        data-testid="submit-sales-entry"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Sales"
        )}
      </Button>
    </div>
  );
}
