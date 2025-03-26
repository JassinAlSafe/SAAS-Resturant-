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
    <div className="flex items-center justify-between py-4 px-2 border-b border-neutral-100">
      <div className="relative">
        <button
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-orange-600"
          onClick={() => setCalendarOpen(!calendarOpen)}
        >
          <CalendarIcon className="h-4 w-4 text-orange-500" />
          {selectedDate ? (
            <span>{format(selectedDate, "EEEE, MMM d, yyyy")}</span>
          ) : (
            <span className="text-neutral-400">Select date</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400 ml-1" />
        </button>

        {calendarOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 p-4 shadow-sm bg-white rounded-lg w-72 border border-neutral-100">
            <input
              type="date"
              className="w-full p-2 text-sm border-b border-neutral-100 mb-3 focus:outline-none"
              value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
              onChange={handleDateChange}
            />
            <div className="flex justify-between">
              <button
                className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700"
                onClick={() => setCalendarOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-orange-700"
                onClick={() => setCalendarOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleInventoryImpact}
          className="text-sm font-medium text-neutral-600 hover:text-orange-600 transition-colors flex items-center gap-1.5"
        >
          {showInventoryImpact ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span>{showInventoryImpact ? "Hide" : "Show"} Inventory</span>
        </button>

        <button
          onClick={onClearAll}
          disabled={!hasSalesEntries}
          className="text-sm font-medium text-neutral-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:hover:text-neutral-600"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear All</span>
        </button>

        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1.5"
          >
            <span>View History</span>
          </button>
        )}
      </div>
    </div>
  );
}
