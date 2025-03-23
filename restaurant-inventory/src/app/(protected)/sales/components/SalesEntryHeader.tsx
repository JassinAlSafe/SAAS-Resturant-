"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Trash, Eye, EyeOff, RefreshCw } from "lucide-react";

interface SalesEntryHeaderProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  showInventoryImpact: boolean;
  onToggleInventoryImpact: () => void;
  onClearAll: () => void;
  hasSalesEntries: boolean;
  onLoadPreviousDay: () => void;
  hasPreviousDayTemplate: boolean;
}

export function SalesEntryHeader({
  selectedDate,
  onDateSelect,
  showInventoryImpact,
  onToggleInventoryImpact,
  onClearAll,
  hasSalesEntries,
  onLoadPreviousDay,
  hasPreviousDayTemplate,
}: SalesEntryHeaderProps) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 border-b bg-background/50">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <p className="text-sm text-muted-foreground">
          Enter quantities sold for today\'s sales
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              size="sm"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              aria-label="Select date for sales entry"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "EEEE, MMM d, yyyy")
              ) : (
                <span>Select date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
              fromDate={firstDayOfMonth}
              toDate={lastDayOfMonth}
              weekStartsOn={1}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showInventoryImpact ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleInventoryImpact}
            className="shrink-0"
            aria-label={`${
              showInventoryImpact ? "Hide" : "Show"
            } inventory impact`}
          >
            {showInventoryImpact ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showInventoryImpact ? "Hide" : "Show"} Inventory
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="shrink-0"
            disabled={!hasSalesEntries}
            aria-label="Clear all sales entries"
          >
            <Trash className="h-4 w-4 mr-2" />
            Clear All
          </Button>

          {hasPreviousDayTemplate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadPreviousDay}
              className="shrink-0"
              aria-label="Load previous day\'s sales template"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Previous
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
