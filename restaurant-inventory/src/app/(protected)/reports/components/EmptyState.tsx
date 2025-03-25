"use client";

import { FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card className="flex flex-col items-center justify-center p-8 text-center border border-gray-200 shadow-sm rounded-xl bg-white">
      <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl mb-5 shadow-sm border border-orange-200">
        <FileBarChart2 className="h-10 w-10 text-orange-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 mb-6 max-w-sm">
        {description}
      </p>
      {onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow transition-all duration-200"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
