"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { DateRangeSelectorProps } from "../types";

export function DateRangeSelector({
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
}: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelect = useCallback(
    (value: Date | { from: Date; to: Date } | null) => {
      if (value && typeof value === 'object' && 'from' in value) {
        const range = {
          from: value.from,
          to: value.to
        };
        
        setCustomDateRange(range);
        
        if (range.from && range.to) {
          setDateRange(range);
          setIsCalendarOpen(false);
        }
      }
    },
    [setCustomDateRange, setDateRange]
  );

  return (
    <div className="grid gap-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
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
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange && dateRange.from ? {
              from: dateRange.from,
              to: dateRange.to || dateRange.from
            } : null}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
