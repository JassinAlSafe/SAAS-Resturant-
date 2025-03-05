"use client";

import { SalesMetricCardProps } from "../types";
import { ArrowUpIcon, ArrowDownIcon, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SalesMetricCard = ({
  title,
  value,
  change,
  positive,
  previousValue,
  tooltip,
}: SalesMetricCardProps) => (
  <div className="bg-card p-4 rounded-lg shadow-sm border border-border/40">
    <div className="flex justify-between items-start mb-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
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
    {previousValue && (
      <p className="text-xs text-muted-foreground mt-1">
        Previous: {previousValue}
      </p>
    )}
  </div>
);
