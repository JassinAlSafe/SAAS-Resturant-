"use client";

import React from "react";
import { FileBarChart2, FileSpreadsheet, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SalesHeaderProps {
  totalSales?: number;
  isLoading?: boolean;
  onViewReports?: () => void;
  onViewHistory?: () => void;
}

const SalesHeader: React.FC<SalesHeaderProps> = ({
  totalSales,
  isLoading,
  onViewReports,
  onViewHistory,
}) => {
  return (
    <div className="flex items-center justify-between w-full mb-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FileBarChart2 className="h-6 w-6 text-primary" />
          </div>
          {totalSales !== undefined && totalSales > 0 && (
            <div className="absolute -top-2 -right-2 bg-primary text-[11px] text-white rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {totalSales > 99 ? "99+" : totalSales}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sales Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record daily sales data and analyze your restaurant&apos;s
            performance
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isLoading && totalSales !== undefined && (
          <div className="text-sm text-muted-foreground mr-2">
            Showing data for {totalSales} {totalSales === 1 ? "sale" : "sales"}
          </div>
        )}

        <div className="flex gap-2">
          {onViewHistory && (
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={onViewHistory}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Sales History
            </Button>
          )}

          {onViewReports && (
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={onViewReports}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Reports
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHeader;
