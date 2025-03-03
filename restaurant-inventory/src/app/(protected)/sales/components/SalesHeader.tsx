"use client";

import { ApiError } from "@/components/ui/api-error";

interface SalesHeaderProps {
  error?: string | null;
  retry?: () => void;
}

export default function SalesHeader({ error, retry }: SalesHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Sales Entry</h1>
      <p className="text-sm text-muted-foreground">
        Record daily sales and view sales history
      </p>

      {error && retry && (
        <ApiError title="Sales Data Error" message={error} onRetry={retry} />
      )}
    </div>
  );
}
