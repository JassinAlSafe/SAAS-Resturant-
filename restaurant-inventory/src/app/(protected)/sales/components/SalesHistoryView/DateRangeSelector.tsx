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
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start border-b border-neutral-100 py-4 pb-6">
      <div className="flex flex-wrap gap-2">
        {DATE_RANGES.map((range, index) => (
          <button
            key={index}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              format(startDate, "yyyy-MM-dd") ===
                format(range.startDate, "yyyy-MM-dd") &&
              format(endDate, "yyyy-MM-dd") ===
                format(range.endDate, "yyyy-MM-dd")
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "text-neutral-600 hover:text-orange-600 hover:bg-orange-50"
            } min-w-24 flex justify-center`}
            onClick={() => onDateRangeSelect(range)}
          >
            {range.label}
          </button>
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
        <button
          className="w-10 h-10 flex items-center justify-center rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          onClick={onFilter}
          disabled={isLoading}
          aria-label="Filter sales data"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Filter className="h-4 w-4" />
          )}
        </button>
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
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-neutral-500"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          id={id}
          value={format(date, "yyyy-MM-dd")}
          onChange={(e) =>
            e.target.valueAsDate && onSelect(e.target.valueAsDate)
          }
          className="input input-sm w-[140px] h-10 pl-3 pr-10 rounded-md border border-neutral-200 focus:outline-none focus:border-orange-500 bg-transparent transition-colors"
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
}
