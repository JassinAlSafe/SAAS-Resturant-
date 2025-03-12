"use client";

import React from "react";
import { FileBarChart2 } from "lucide-react";
import SalesActions from "./SalesActions";

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

        <SalesActions
          onViewReports={onViewReports}
          onViewHistory={onViewHistory}
        />
      </div>
    </div>
  );
};

export default SalesHeader;
