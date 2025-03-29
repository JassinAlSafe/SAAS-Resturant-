"use client";

import { Suspense } from "react";
import BillingContent from "./BillingContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Loading component for the Suspense fallback
function BillingLoadingState() {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl px-4">
      <div className="flex flex-col gap-4 text-center">
        <Skeleton className="h-10 w-1/3 mx-auto" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
      </div>

      <Card className="border-none shadow-sm rounded-xl">
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-20 mb-2 mx-auto" />
              <div className="flex justify-center">
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-20 mb-2 mx-auto" />
              <div className="flex justify-center">
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-20 mb-2 mx-auto" />
              <div className="flex justify-center">
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Skeleton className="h-12 w-full max-w-2xl rounded-full bg-orange-100/30" />
      </div>

      <Card className="border-none shadow-sm rounded-xl">
        <CardContent>
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
