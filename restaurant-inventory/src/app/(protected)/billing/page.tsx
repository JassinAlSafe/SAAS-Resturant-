"use client";

import { Suspense } from "react";
import BillingContent from "./BillingContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Loading component for the Suspense fallback
function BillingLoadingState() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900/50">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-12 w-full" />

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Main export wrapped in Suspense
export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoadingState />}>
      <BillingContent />
    </Suspense>
  );
}
