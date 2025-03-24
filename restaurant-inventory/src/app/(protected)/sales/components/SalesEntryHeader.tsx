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
import { CalendarIcon, Trash2, Eye, EyeOff, RotateCcw } from "lucide-react";

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
    <div className="border-b bg-background/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="px-8 py-5">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Menu Items
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter quantities sold for today&apos;s sales
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  size="default"
                  className={cn(
                    "h-10 w-[240px] justify-start text-left font-normal border-slate-200 bg-white",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 text-slate-500" />
                  {selectedDate ? (
                    format(selectedDate, "EEEE, MMM d, yyyy")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-lg" align="end">
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

            <Button
              type="button"
              variant={showInventoryImpact ? "default" : "outline"}
              size="default"
              onClick={onToggleInventoryImpact}
              className={cn(
                "h-10",
                showInventoryImpact
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-slate-200 bg-white"
              )}
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
              size="default"
              onClick={onClearAll}
              disabled={!hasSalesEntries}
              className="h-10 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>

            {hasPreviousDayTemplate && (
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={onLoadPreviousDay}
                className="h-10 border-slate-200 bg-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Load Previous
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
