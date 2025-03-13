"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function LoadingIndicator() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-8 w-[140px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-4 w-[100px] mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-4 w-[120px] mb-4" />
          <div className="flex items-center justify-center">
            <Skeleton className="h-[240px] w-[240px] rounded-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
