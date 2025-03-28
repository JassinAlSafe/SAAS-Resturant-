"use client";

import { Calendar, Download, Filter, FileBarChart2 } from "lucide-react";
import { DateRangeSelector } from "@/components/ui/Common/DateRangeSelector/DateRangeSelector";
import { ReportsFilter } from "./ReportsFilter";
import { DateRange, TabType } from "../types";
import { ReportFilters } from "./ReportsFilter";
import "react-day-picker/dist/style.css";

interface ReportsHeaderProps {
  currentTime: string;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  customDateRange: DateRange | undefined;
  setCustomDateRange: (range: DateRange | undefined) => void;
  onExport: () => void;
  onFilterChange: (filters: ReportFilters) => void;
  activeTab: TabType;
}

export function ReportsHeader({
  currentTime,
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
  onExport,
  onFilterChange,
  activeTab,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-400/10 rounded-xl">
          <FileBarChart2 className="h-8 w-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            View unified sales, inventory, and business analytics
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="tooltip" data-tip="Data is refreshed every 5 minutes">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md text-sm text-gray-600 border border-gray-200 shadow-sm">
            <Calendar className="h-4 w-4" />
            <span>{currentTime}</span>
          </div>
        </div>

        <div className="date-range-wrapper">
          <DateRangeSelector
            dateRange={dateRange}
            setDateRange={setDateRange}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
          />
        </div>

        <div className="tooltip" data-tip="Export to CSV">
          <button
            onClick={onExport}
            className="p-2 bg-white rounded-md text-orange-500 border border-gray-200 shadow-sm hover:bg-orange-50 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-md text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 text-orange-500" />
            <span className="hidden md:inline text-sm">Filter</span>
          </label>
          <ReportsFilter
            tabIndex={0}
            activeTab={activeTab}
            onFilterChange={onFilterChange}
          />
        </div>
      </div>
    </div>
  );
}
