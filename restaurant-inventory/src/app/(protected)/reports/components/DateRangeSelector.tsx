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
import { Label } from "@/components/ui/label";

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
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "Select date range";
    if (!range.to) return format(range.from, "LLL dd, y");
    return `${format(range.from, "LLL dd, y")} - ${format(
      range.to,
      "LLL dd, y"
    )}`;
  };

  return (
    <div
      className={cn("grid gap-2", className)}
      role="group"
      aria-label="Date range selection"
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-range-selector"
            variant="outline"
            className={cn(
              "w-full md:w-[300px] justify-start text-left font-normal",
              "hover:bg-muted/5 focus:ring-2 focus:ring-ring focus:ring-offset-2",
              !dateRange?.from && "text-muted-foreground"
            )}
            aria-label={`Selected date range: ${formatDateRange(dateRange)}`}
          >
            <CalendarIcon
              className="mr-2 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{formatDateRange(dateRange)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          sideOffset={8}
          role="dialog"
          aria-label="Date range picker"
        >
          <div className="flex flex-col gap-4 p-4 border-b bg-muted/5">
            <div className="space-y-2">
              <Label htmlFor="preset-range">Quick select</Label>
              <Select
                onValueChange={(value) => {
                  const today = new Date();
                  const from = new Date();

                  switch (value) {
                    case "7d":
                      from.setDate(today.getDate() - 7);
                      break;
                    case "30d":
                      from.setDate(today.getDate() - 30);
                      break;
                    case "90d":
                      from.setDate(today.getDate() - 90);
                      break;
                    case "custom":
                      setDateRange(customDateRange || undefined);
                      return;
                  }

                  setDateRange({ from, to: today });
                }}
                defaultValue="7d"
              >
                <SelectTrigger
                  id="preset-range"
                  className="w-[200px] h-9"
                  aria-label="Select a preset date range"
                >
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
          </div>

          <div className="p-4">
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
              className="rounded-md border"
              classNames={{
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                day_today: "bg-muted text-foreground",
              }}
              aria-label="Date range calendar"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
