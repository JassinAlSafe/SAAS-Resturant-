"use client";

import { SalesMetricCardProps } from "../types";
import { ArrowUp, ArrowDown, Info } from "lucide-react";

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
    className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${
      className || ""
    }`}
    role="region"
    aria-label={`${title} metric card`}
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {tooltip && (
        <div className="tooltip tooltip-left" data-tip={tooltip}>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={`More information about ${title}`}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>

    <div className="space-y-2">
      <p
        className="text-2xl font-bold tracking-tight text-gray-900 line-clamp-1"
        aria-label={`Current value: ${value}`}
      >
        {value}
      </p>

      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            positive ? "text-green-600" : "text-red-600"
          }`}
        >
          {positive ? (
            <>
              <ArrowUp
                className="h-3 w-3"
                aria-label="Increase from previous period"
              />
              <span className="whitespace-nowrap">{change}</span>
            </>
          ) : (
            <>
              <ArrowDown
                className="h-3 w-3"
                aria-label="Decrease from previous period"
              />
              <span className="whitespace-nowrap">{change}</span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-500">vs. previous period</span>
      </div>

      {previousValue && (
        <p
          className="text-xs text-gray-500"
          aria-label={`Previous value: ${previousValue}`}
        >
          Previous: {previousValue}
        </p>
      )}
    </div>
  </div>
);
