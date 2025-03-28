"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ShoppingListWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function ShoppingListWrapper({
  children,
  isLoading = false,
  title,
  description,
}: ShoppingListWrapperProps) {
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        {(title || description) && (
          <CardHeader className="pb-2">
            {title && <Skeleton className="h-8 w-48" />}
            {description && <Skeleton className="h-4 w-64 mt-1" />}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If title or description are provided, render with CardHeader
  if (title || description) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  // Otherwise, render children directly
  return <>{children}</>;
}
