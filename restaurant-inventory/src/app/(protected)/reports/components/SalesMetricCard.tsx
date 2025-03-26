"use client";

import { SalesMetricCardProps } from "../types";
import { ArrowUpIcon, ArrowDownIcon, InfoIcon } from "lucide-react";

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
    className={`card bg-base-100 p-6 shadow-sm border hover:shadow-md transition-all duration-200 ${
      className || ""
    }`}
    role="region"
    aria-label={`${title} metric card`}
  >
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-sm font-medium text-base-content text-opacity-60">
        {title}
      </h3>
      {tooltip && (
        <div className="tooltip tooltip-left" data-tip={tooltip}>
          <button
            type="button"
            className="text-base-content text-opacity-60 hover:text-opacity-100 transition-colors"
            aria-label={`More information about ${title}`}
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </div>
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
          className={`flex items-center gap-1 text-xs font-medium ${
            positive ? "text-success" : "text-error"
          }`}
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
          className="text-xs text-base-content text-opacity-60"
          aria-label={`Previous value: ${previousValue}`}
        >
          Previous: {previousValue}
        </p>
      )}
    </div>
  </div>
);
