"use client";

import { format } from "date-fns";
import { CalendarIcon, Trash2, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SalesEntryHeaderProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  showInventoryImpact: boolean;
  onToggleInventoryImpact: () => void;
  onClearAll: () => void;
  hasSalesEntries: boolean;
  onViewHistory?: () => void;
}

export function SalesEntryHeader({
  selectedDate,
  onDateSelect,
  showInventoryImpact,
  onToggleInventoryImpact,
  onClearAll,
  hasSalesEntries,
  onViewHistory,
}: SalesEntryHeaderProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.valueAsDate) {
      onDateSelect(e.target.valueAsDate);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between py-4 px-4 mb-2 border-b border-orange-50">
      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-orange-600 bg-orange-50/50 px-3 py-2 rounded-full"
          onClick={() => setCalendarOpen(!calendarOpen)}
        >
          <CalendarIcon className="h-4 w-4 text-orange-500" />
          {selectedDate ? (
            <span>{format(selectedDate, "EEEE, MMM d, yyyy")}</span>
          ) : (
            <span className="text-neutral-400">Select date</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-orange-400 ml-1" />
        </button>

        {calendarOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 p-4 shadow-sm bg-white rounded-xl border-none w-72">
            <input
              type="date"
              className="w-full p-2 text-sm border-b border-orange-100 mb-3 focus:outline-none focus:border-orange-400"
              value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
              onChange={handleDateChange}
            />
            <div className="flex justify-between">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 rounded-full"
                onClick={() => setCalendarOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-full"
                onClick={() => setCalendarOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
        <button
          type="button"
          onClick={onToggleInventoryImpact}
          className="text-sm font-medium text-neutral-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 bg-orange-50/50 px-3 py-2 rounded-full"
        >
          {showInventoryImpact ? (
            <EyeOff className="h-4 w-4 text-orange-500" />
          ) : (
            <Eye className="h-4 w-4 text-orange-500" />
          )}
          <span>{showInventoryImpact ? "Hide" : "Show"} Inventory</span>
        </button>

        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasSalesEntries}
          className="text-sm font-medium text-neutral-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:hover:text-neutral-600 bg-orange-50/50 px-3 py-2 rounded-full"
        >
          <Trash2 className="h-4 w-4 text-orange-500" />
          <span>Clear All</span>
        </button>

        {onViewHistory && (
          <button
            type="button"
            onClick={onViewHistory}
            className="text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-full"
          >
            <span>View History</span>
          </button>
        )}
      </div>
    </div>
  );
}
