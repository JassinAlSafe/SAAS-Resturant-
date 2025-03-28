"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

// Using the correct type interface
export interface DateRangeSelectorProps {
  dateRange:
    | {
        from?: Date;
        to?: Date;
      }
    | undefined;
  setDateRange: (range: { from?: Date; to?: Date } | undefined) => void;
  customDateRange:
    | {
        from?: Date;
        to?: Date;
      }
    | undefined;
  setCustomDateRange: (range: { from?: Date; to?: Date } | undefined) => void;
  className?: string;
}

export function DateRangeSelector({
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
  className,
}: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format the selected date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from) return "Select dates";

    if (dateRange.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(
        dateRange.to,
        "MMM d, yyyy"
      )}`;
    }

    return format(dateRange.from, "LLL dd, y");
  }, [dateRange]);

  // Handle date range selection
  const handleSelect = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      setCustomDateRange(range);
      if (range?.from && range?.to) {
        setDateRange(range);
        setIsCalendarOpen(false);
      }
    },
    [setCustomDateRange, setDateRange]
  );

  // Toggle calendar visibility
  const toggleCalendar = useCallback(() => {
    setIsCalendarOpen((prev) => !prev);
  }, []);

  // Handle clicks outside to close the calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isCalendarOpen
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        onClick={toggleCalendar}
        aria-expanded={isCalendarOpen}
        aria-haspopup="dialog"
        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-sm"
      >
        <CalendarIcon className="h-4 w-4 text-orange-500" />
        <span className="whitespace-nowrap">{formattedDateRange}</span>
      </button>

      {isCalendarOpen && (
        <div className="absolute right-0 mt-2 z-50">
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Select date range</h4>
                <p className="text-xs text-gray-500">
                  Choose start and end dates
                </p>
              </div>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close calendar"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <DayPicker
              mode="range"
              defaultMonth={customDateRange?.from}
              selected={customDateRange as { from: Date; to?: Date } | undefined}
              onSelect={handleSelect}
              numberOfMonths={1}
              className="border-none"
              modifiersStyles={{
                selected: {
                  backgroundColor: "",
                  color: "white",
                },
                today: {
                  color: "",
                  fontWeight: "",
                },
              }}
            />

            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setDateRange(undefined);
                  setCustomDateRange(undefined);
                  setIsCalendarOpen(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .rdp-months {
          display: flex;
          justify-content: center;
        }
        .rdp-month {
          background-color: #fff;
        }
        .rdp-day_range_start,
        .rdp-day_range_end {
          background-color: #f97316 !important;
          color: white !important;
        }
        .rdp-day_range_middle {
          background-color: #ffedd5 !important;
          color: #7c2d12 !important;
        }
      `}</style>
    </div>
  );
}
