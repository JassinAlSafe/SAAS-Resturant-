"use client";

import { useCallback, memo } from "react";
import { Calendar, FileBarChart2 } from "lucide-react";
import { DateRangeSelector } from "@/components/ui/Common/DateRangeSelector/DateRangeSelector";
import { ReportsFilter, ReportFilters } from "./ReportsFilter";
import { TabType } from "../types";
import { ExportButton } from "@/components/ui/Common";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ReportsHeaderProps {
  currentTime: string;
  dateRange: DateRange;
  setDateRange: (range: DateRange | undefined) => void;
  customDateRange: DateRange | undefined;
  setCustomDateRange: (range: DateRange | undefined) => void;
  onExport: () => void;
  onFilterChange: (filters: ReportFilters) => void;
  activeTab: TabType;
}

// Action button component
const ActionButton = memo(
  ({
    onClick,
    tooltip,
    icon: Icon,
  }: {
    onClick: () => void;
    tooltip: string;
    icon: React.ElementType;
  }) => (
    <div className="tooltip" data-tip={tooltip}>
      <button
        onClick={onClick}
        className="p-2 bg-background rounded-lg border-0 shadow-sm hover:bg-muted/50 transition-colors"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  )
);

ActionButton.displayName = "ActionButton";

export const ReportsHeader = memo(
  ({
    currentTime,
    dateRange,
    setDateRange,
    customDateRange,
    setCustomDateRange,
    onExport,
    onFilterChange,
    activeTab,
  }: ReportsHeaderProps) => {
    const handleExport = useCallback(() => {
      onExport();
    }, [onExport]);

    return (
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FileBarChart2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
        </div>

        <p className="text-muted-foreground">
          View unified sales, inventory, and business analytics
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-2">
          <div className="tooltip" data-tip="Data is refreshed every 5 minutes">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-sm text-muted-foreground border shadow-sm">
              <Calendar className="h-4 w-4" />
              <span>{currentTime}</span>
            </div>
          </div>

          <DateRangeSelector
            dateRange={dateRange}
            setDateRange={setDateRange}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
            className="date-range-wrapper"
          />

          <ExportButton
            label="Export"
            onExport={handleExport}
            variant="ghost"
            size="sm"
            title="Export to CSV"
            className="border-0 h-9 hover:bg-secondary/80 text-foreground"
          />

          <ReportsFilter
            activeTab={activeTab}
            onFilterChange={onFilterChange}
          />
        </div>
      </div>
    );
  }
);

ReportsHeader.displayName = "ReportsHeader";
