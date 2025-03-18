"use client";

import { useState, useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface RefreshingStatusProps {
  isRefreshing: boolean;
  message?: string;
  className?: string;
}

export function RefreshingStatus({
  isRefreshing,
  message = "Refreshing dashboard data...",
  className,
}: RefreshingStatusProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Control the visibility of the refreshing status
  useEffect(() => {
    if (isRefreshing) {
      setShowSpinner(true);

      // Clear any existing timer
      if (timer) {
        clearTimeout(timer);
      }

      // Set a new timer to hide the spinner after 3 seconds
      // This ensures we don't show an endless loading state
      const newTimer = setTimeout(() => {
        setShowSpinner(false);
      }, 3000);

      setTimer(newTimer);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isRefreshing, timer]);

  if (!showSpinner) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-md",
        className
      )}
    >
      <FiRefreshCw className={cn("h-3.5 w-3.5 animate-spin")} />
      <span>{message}</span>
    </div>
  );
}
