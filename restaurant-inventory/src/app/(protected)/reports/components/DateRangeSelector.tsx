"use client";

import { Button } from "@/components/ui/button";
import Card from "@/components/Card";
import { FiCalendar } from "react-icons/fi";
import { DateRangeSelectorProps } from "../types";

export const DateRangeSelector = ({
  dateRange,
  setDateRange,
}: DateRangeSelectorProps) => (
  <Card className="mb-6 shadow-sm border-0 bg-card">
    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 p-1">
      <div className="flex items-center mr-4 mb-2 sm:mb-0">
        <FiCalendar className="h-4 w-4 text-muted-foreground mr-2" />
        <span className="text-sm font-medium text-muted-foreground">
          Time Range:
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
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
      </div>
    </div>
  </Card>
);
