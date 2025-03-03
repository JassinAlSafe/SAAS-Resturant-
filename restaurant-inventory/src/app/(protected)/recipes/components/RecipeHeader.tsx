"use client";

import { ApiError } from "@/components/ui/api-error";

interface RecipeHeaderProps {
  error?: string;
  retry?: () => void;
}

export default function RecipeHeader({ error, retry }: RecipeHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Recipe Management</h1>
      <p className="text-sm text-muted-foreground">
        Create and manage recipes for your restaurant
      </p>

      {error && retry && (
        <ApiError title="Recipe Data Error" message={error} onRetry={retry} />
      )}
    </div>
  );
}
