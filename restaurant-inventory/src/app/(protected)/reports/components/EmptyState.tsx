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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10">
      <div className="flex flex-col items-center justify-center text-center px-6">
        <div className="p-4 bg-blue-50 rounded-xl mb-5 border border-blue-100 w-16 h-16 flex items-center justify-center">
          <FileBarChart2 className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6 max-w-md">
          {description}
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
