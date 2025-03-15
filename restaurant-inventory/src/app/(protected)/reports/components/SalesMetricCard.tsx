"use client";

import { SalesMetricCardProps } from "../types";
import { ArrowUpIcon, ArrowDownIcon, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const SalesMetricCard = ({
  title,
  value,
  change,
  positive,
  previousValue,
  tooltip,
  className,
}: SalesMetricCardProps) => (
  <div
    className={cn(
      "group bg-card p-6 rounded-lg shadow-xs border border-border/40 hover:shadow-md transition-all duration-200",
      className
    )}
    role="region"
    aria-label={`${title} metric card`}
  >
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`More information about ${title}`}
              >
                <InfoIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs text-xs bg-popover p-2 shadow-lg"
            >
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>

    <div className="space-y-2">
      <p
        className="text-2xl font-semibold tracking-tight line-clamp-1"
        aria-label={`Current value: ${value}`}
      >
        {value}
      </p>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            positive ? "text-green-600" : "text-red-600"
          )}
        >
          {positive ? (
            <ArrowUpIcon
              className="h-3 w-3"
              aria-label="Increase from previous period"
            />
          ) : (
            <ArrowDownIcon
              className="h-3 w-3"
              aria-label="Decrease from previous period"
            />
          )}
          <span>{change} from last period</span>
        </div>
      </div>

      {previousValue && (
        <p
          className="text-xs text-muted-foreground"
          aria-label={`Previous value: ${previousValue}`}
        >
          Previous: {previousValue}
        </p>
      )}
    </div>
  </div>
);
