"use client";

import { FileBarChart2 } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No data available",
  description = "There is no data available for the selected date range.",
  actionLabel = "Refresh Data",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body items-center text-center">
        <div className="p-4 bg-orange-50 rounded-xl mb-5 shadow-sm border border-orange-200">
          <FileBarChart2 className="h-10 w-10 text-orange-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6 max-w-sm">
          {description}
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="btn btn-primary bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow transition-all duration-200"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
