import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth } from "date-fns";
import { CalendarIcon, Filter } from "lucide-react";

// Predefined date ranges for quick selection
const DATE_RANGES = [
  {
    label: "Last 7 days",
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  },
  {
    label: "Last 30 days",
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  },
  {
    label: "This month",
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
  },
];

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeSelect: (range: { startDate: Date; endDate: Date }) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onFilter: () => void;
  isLoading: boolean;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeSelect,
  onStartDateChange,
  onEndDateChange,
  onFilter,
  isLoading,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start bg-card p-4 rounded-lg border">
      <div className="flex flex-wrap gap-2">
        {DATE_RANGES.map((range, index) => (
          <Button
            key={index}
            variant={
              format(startDate, "yyyy-MM-dd") ===
                format(range.startDate, "yyyy-MM-dd") &&
              format(endDate, "yyyy-MM-dd") ===
                format(range.endDate, "yyyy-MM-dd")
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => onDateRangeSelect(range)}
            className="min-w-24 justify-center"
          >
            {range.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <DateInput
          id="start-date"
          label="Start Date"
          date={startDate}
          onSelect={onStartDateChange}
        />
        <DateInput
          id="end-date"
          label="End Date"
          date={endDate}
          onSelect={onEndDateChange}
        />
        <Button
          size="icon"
          variant="default"
          className="h-9 w-9"
          onClick={onFilter}
          disabled={isLoading}
          aria-label="Filter sales data"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface DateInputProps {
  id: string;
  label: string;
  date: Date;
  onSelect: (date: Date) => void;
}

function DateInput({ id, label, date, onSelect }: DateInputProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            size="sm"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate: Date | undefined) =>
              newDate && onSelect(newDate)
            }
            initialFocus
            weekStartsOn={1}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
