"use client";

import Card from "@/components/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
