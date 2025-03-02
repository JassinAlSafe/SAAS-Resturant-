import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

interface ApiErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable component for displaying API errors with retry functionality
 */
export function ApiError({
  title = "Error",
  message,
  onRetry,
  className = "",
}: ApiErrorProps) {
  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <FiAlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={onRetry}
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
