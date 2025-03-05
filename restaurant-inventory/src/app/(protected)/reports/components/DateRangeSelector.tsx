"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card";
import { FiCalendar } from "react-icons/fi";
import { DateRangeSelectorProps } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DateRangeSelector = ({
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
}: DateRangeSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Handle custom date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!customDateRange.from) {
      setCustomDateRange({ from: date, to: undefined });
      return;
    }

    if (date < customDateRange.from) {
      setCustomDateRange({ from: date, to: customDateRange.from });
    } else {
      setCustomDateRange({ from: customDateRange.from, to: date });
      setIsCalendarOpen(false);
      setDateRange("custom");
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!customDateRange.from) return "Select dates";

    if (!customDateRange.to) {
      return format(customDateRange.from, "MMM dd, yyyy");
    }

    return `${format(customDateRange.from, "MMM dd")} - ${format(
      customDateRange.to,
      "MMM dd, yyyy"
    )}`;
  };

  return (
    <Card className="mb-6 shadow-sm border-0 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 p-1">
        <div className="flex items-center mr-4 mb-2 sm:mb-0">
          <FiCalendar className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm font-medium text-muted-foreground">
            Time Range:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={dateRange === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange("week")}
                  className={`text-xs py-1 px-2 h-auto rounded-md ${
                    dateRange === "week"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Last 7 Days
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>
                  Data from {format(subDays(new Date(), 7), "MMM dd")} to today
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={dateRange === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange("month")}
                  className={`text-xs py-1 px-2 h-auto rounded-md ${
                    dateRange === "month"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Last 30 Days
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>
                  Data from {format(subDays(new Date(), 30), "MMM dd")} to today
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={dateRange === "quarter" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange("quarter")}
                  className={`text-xs py-1 px-2 h-auto rounded-md ${
                    dateRange === "quarter"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Last 90 Days
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>
                  Data from {format(subDays(new Date(), 90), "MMM dd")} to today
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={dateRange === "custom" ? "secondary" : "ghost"}
                size="sm"
                className={`text-xs py-1 px-2 h-auto rounded-md ${
                  dateRange === "custom"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {dateRange === "custom" ? formatDateRange() : "Custom Range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: customDateRange.from,
                  to: customDateRange.to,
                }}
                onSelect={(range: any) => {
                  if (range?.from) {
                    setCustomDateRange({
                      from: range.from,
                      to: range.to,
                    });
                    if (range.to) {
                      setDateRange("custom");
                      setIsCalendarOpen(false);
                    }
                  }
                }}
                initialFocus
                numberOfMonths={2}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
};
