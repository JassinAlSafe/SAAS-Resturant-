"use client";

import { SalesMetricCardProps } from "../types";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export const SalesMetricCard = ({
  title,
  value,
  change,
  positive,
}: SalesMetricCardProps) => (
  <div className="bg-card p-4 rounded-lg shadow-sm border border-border/40">
    <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
    <p className="text-2xl font-semibold mb-2 line-clamp-1">{value}</p>
    <div className="flex items-center gap-1">
      {positive ? (
        <ArrowUpIcon className="h-3 w-3 text-green-500" />
      ) : (
        <ArrowDownIcon className="h-3 w-3 text-red-500" />
      )}
      <p className={`text-xs ${positive ? "text-green-500" : "text-red-500"}`}>
        {change} from last period
      </p>
    </div>
  </div>
);
