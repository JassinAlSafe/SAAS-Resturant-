"use client";

import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency";
import { Loader2, Save, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky bottom-0 left-0 right-0 z-50 shadow-md"
    >
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <div className="text-sm font-medium text-muted-foreground">
          Total Sales
        </div>
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(total || 0)}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isDisabled || isSubmitting}
        className="w-full sm:w-auto px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
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
        {!isSubmitting && !isDisabled && (
          <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
        )}
      </Button>
    </motion.div>
  );
}
