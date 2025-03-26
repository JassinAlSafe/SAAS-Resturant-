"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangeSelectorProps } from "../types";
import "react-day-picker/dist/style.css";

export function DateRangeSelector({
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
}: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelect = useCallback(
    (range: DateRange | undefined) => {
      setCustomDateRange(range);
      if (range?.from && range?.to) {
        setDateRange(range);
        setIsCalendarOpen(false);
      }
    },
    [setCustomDateRange, setDateRange]
  );

  return (
    <div className="grid gap-2">
      <div className="dropdown dropdown-end">
        <label
          tabIndex={0}
          className="btn btn-outline normal-case w-[240px] justify-start text-left"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </label>
        <div
          tabIndex={0}
          className={`dropdown-content z-50 p-2 shadow bg-base-100 rounded-box w-auto ${
            isCalendarOpen ? "block" : "hidden"
          }`}
        >
          <div className="bg-base-100 p-4 rounded-lg shadow-lg">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={customDateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              className="border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
