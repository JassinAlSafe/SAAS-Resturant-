"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangeSelectorProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  customDateRange: DateRange | undefined;
  setCustomDateRange: (date: DateRange | undefined) => void;
  className?: string;
}

export function DateRangeSelector({
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
  className,
}: DateRangeSelectorProps) {
  return (
    <div className={cn("grid gap-2 mb-6", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full md:w-[280px] justify-start text-left font-normal bg-background",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
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
        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <div className="flex items-center gap-2 border-b p-4 bg-muted/5">
            <Select
              onValueChange={(value) => {
                const today = new Date();
                const from = new Date();
                if (value === "7d") {
                  from.setDate(today.getDate() - 7);
                  setDateRange({ from, to: today });
                } else if (value === "30d") {
                  from.setDate(today.getDate() - 30);
                  setDateRange({ from, to: today });
                } else if (value === "90d") {
                  from.setDate(today.getDate() - 90);
                  setDateRange({ from, to: today });
                } else if (value === "custom") {
                  setDateRange(customDateRange || undefined);
                }
              }}
              defaultValue="7d"
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select preset range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                setCustomDateRange(range);
              }}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
