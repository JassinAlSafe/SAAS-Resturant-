"use client";

import { Button } from "@/components/ui/button";
import { CurrencySelector } from "@/components/currency-selector";
import { FiBarChart2, FiFileText } from "react-icons/fi";

interface SalesActionsProps {
  onViewReports?: () => void;
  onViewHistory?: () => void;
}

export default function SalesActions({
  onViewReports,
  onViewHistory,
}: SalesActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <CurrencySelector />

      {onViewHistory && (
        <Button variant="outline" size="sm" onClick={onViewHistory}>
          <FiFileText className="mr-2 h-4 w-4" />
          Sales History
        </Button>
      )}

      {onViewReports && (
        <Button variant="outline" size="sm" onClick={onViewReports}>
          <FiBarChart2 className="mr-2 h-4 w-4" />
          Reports
        </Button>
      )}
    </div>
  );
}
