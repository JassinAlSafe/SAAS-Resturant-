"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportsWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function ReportsWrapper({
  children,
  isLoading = false,
  title,
  description,
}: ReportsWrapperProps) {
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
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

  // If there's a title/description, render them in a Card
  if (title) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  // Otherwise, just render children in a Card
  return (
    <Card className="border-none shadow-sm rounded-xl">
      <CardContent>{children}</CardContent>
    </Card>
  );
}
