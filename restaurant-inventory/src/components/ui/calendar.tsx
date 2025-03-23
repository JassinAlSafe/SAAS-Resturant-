"use client";

import * as React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | { from: Date; to: Date } | null;
  onSelect?: (date: Date | { from: Date; to: Date } | null) => void;
  disabled?: boolean;
  initialFocus?: boolean;
  numberOfMonths?: number;
  defaultMonth?: Date;
  locale?: any;
  className?: string;
  classNames?: {
    container?: string;
    month?: string;
    caption?: string;
    caption_label?: string;
    nav?: string;
    nav_button?: string;
    nav_button_previous?: string;
    nav_button_next?: string;
    table?: string;
    head_row?: string;
    head_cell?: string;
    row?: string;
    cell?: string;
    day?: string;
    day_selected?: string;
    day_today?: string;
    day_outside?: string;
    day_disabled?: string;
    day_range_middle?: string;
    day_range_end?: string;
    day_hidden?: string;
    day_range_start?: string;
    day_weekend?: string;
  };
};

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
  numberOfMonths = 1,
  defaultMonth,
  locale,
  className,
  classNames,
  ...props
}: CalendarProps) {
  const handleChange = (date: Date | [Date | null, Date | null] | null) => {
    if (!onSelect) return;

    if (mode === "single" && date instanceof Date) {
      onSelect(date);
    } else if (mode === "range" && Array.isArray(date)) {
      const [start, end] = date;
      if (start && end) {
        onSelect({ from: start, to: end });
      } else if (start) {
        onSelect({ from: start, to: start });
      } else {
        onSelect(null);
      }
    } else if (mode === "multiple" && Array.isArray(date)) {
      onSelect(date[0] || null);
    }
  };

  // Convert selected value to format expected by ReactDatePicker
  const getDatePickerValue = () => {
    if (!selected) return null;

    if (mode === "single" && selected instanceof Date) {
      return selected;
    } else if (mode === "range" && typeof selected === "object" && "from" in selected) {
      return [selected.from, selected.to || selected.from];
    } else if (mode === "multiple" && Array.isArray(selected)) {
      return selected;
    }

    return null;
  };

  return (
    <div className={cn("p-3", className)}>
      <ReactDatePicker
        selected={mode === "single" ? getDatePickerValue() as Date | null : undefined}
        startDate={mode === "range" ? (getDatePickerValue() as [Date, Date])?.[0] : undefined}
        endDate={mode === "range" ? (getDatePickerValue() as [Date, Date])?.[1] : undefined}
        onChange={handleChange}
        selectsRange={mode === "range"}
        monthsShown={numberOfMonths}
        locale={locale}
        inline
        disabled={disabled}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        previousMonthButtonLabel={<ChevronLeft className="h-4 w-4" />}
        nextMonthButtonLabel={<ChevronRight className="h-4 w-4" />}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-medium">
              {date.toLocaleString("default", { month: "long", year: "numeric" })}
            </div>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        calendarClassName="bg-background"
        wrapperClassName="w-full"
        dayClassName={(date) => cn("text-center p-0 relative")}
        {...props}
      />
    </div>
  );
}
