"use client";

import React, { useState } from "react";
import {
  FileBarChart2,
  BarChart2,
  Calendar as CalendarIcon,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

interface SalesHeaderProps {
  totalSales?: number;
  isLoading?: boolean;
  onViewReports?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const SalesHeader: React.FC<SalesHeaderProps> = ({
  totalSales,
  isLoading,
  onViewReports,
  activeTab = "daily",
  onTabChange,
  selectedDate = new Date(),
  onDateSelect,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.valueAsDate && onDateSelect) {
      onDateSelect(e.target.valueAsDate);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="p-3 bg-orange-50 rounded-lg">
              <FileBarChart2 className="h-6 w-6 text-orange-600" />
            </div>
            {totalSales !== undefined && totalSales > 0 && (
              <div className="absolute -top-2 -right-2 bg-orange-600 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {totalSales > 99 ? "99+" : totalSales}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Sales Management
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Record daily sales and analyze your restaurant&apos;s performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && totalSales !== undefined && (
            <div className="text-sm text-neutral-500 mr-2">
              Showing data for {totalSales}{" "}
              {totalSales === 1 ? "sale" : "sales"}
            </div>
          )}

          {onDateSelect && (
            <div className="relative">
              <button
                className="btn btn-ghost h-10 w-[240px] justify-start text-left font-normal bg-white rounded-lg text-neutral-800"
                id="date"
                onClick={() => setCalendarOpen(!calendarOpen)}
              >
                <CalendarIcon className="mr-3 h-4 w-4 text-neutral-500" />
                {selectedDate
                  ? format(selectedDate, "EEEE, MMM d, yyyy")
                  : "Select date"}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </button>

              {calendarOpen && (
                <div className="absolute mt-1 z-10 bg-white rounded-lg shadow-md p-4">
                  <div className="calendar">
                    <input
                      type="date"
                      className="input w-full mb-2 border-0 border-b border-neutral-200"
                      value={format(selectedDate, "yyyy-MM-dd")}
                      onChange={handleDateChange}
                    />
                    <div className="flex justify-between">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setCalendarOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-none"
                        onClick={() => setCalendarOpen(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {onViewReports && (
            <button
              className="btn btn-ghost bg-white text-neutral-700 hover:bg-orange-50 rounded-lg"
              onClick={onViewReports}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Reports
            </button>
          )}
        </div>
      </div>

      {onTabChange && (
        <div className="flex">
          <div className="bg-neutral-100 p-1 rounded-full inline-flex">
            <button
              onClick={() => onTabChange("daily")}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "daily"
                  ? "bg-white text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Daily Sales
            </button>
            <button
              onClick={() => onTabChange("history")}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-white text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              <Receipt className="h-4 w-4" />
              Sales Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHeader;
