"use client";

import { useState, useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface LoadingStatusBannerProps {
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingStatusBanner({
  error = null,
  onRetry,
}: LoadingStatusBannerProps) {
  const [visible, setVisible] = useState(false);

  // Control visibility based on error prop
  useEffect(() => {
    if (error) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [error]);

  if (!visible || !error) return null;

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-4 px-4 py-2 text-sm rounded-md",
        "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      )}
    >
      <div className="flex items-center gap-2">
        <FiAlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
        <span>{error}</span>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium underline hover:text-red-800 dark:hover:text-red-300"
        >
          Retry
        </button>
      )}
    </div>
  );
}
