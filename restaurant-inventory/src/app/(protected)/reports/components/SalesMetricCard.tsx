"use client";

import { SalesMetricCardProps } from "../types";

export const SalesMetricCard = ({
  title,
  value,
  change,
  positive,
}: SalesMetricCardProps) => (
  <div className="bg-muted/50 dark:bg-muted/20 p-3 md:p-4 rounded-lg">
    <p className="text-xs md:text-sm font-medium text-muted-foreground">
      {title}
    </p>
    <p className="text-lg md:text-2xl font-semibold mt-1 line-clamp-1">
      {value}
    </p>
    <p
      className={`text-xs mt-1 md:mt-2 ${
        positive ? "text-green-600" : "text-red-600"
      }`}
    >
      {change} from last period
    </p>
  </div>
);
