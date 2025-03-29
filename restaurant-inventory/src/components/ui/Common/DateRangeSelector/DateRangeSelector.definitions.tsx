import { DateRange } from "react-day-picker";

export type DateRangeType = "week" | "month" | "quarter" | "custom";

export interface DateRangeSelectorProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  customDateRange: DateRange | undefined;
  setCustomDateRange: (range: DateRange | undefined) => void;
  className?: string;
}
