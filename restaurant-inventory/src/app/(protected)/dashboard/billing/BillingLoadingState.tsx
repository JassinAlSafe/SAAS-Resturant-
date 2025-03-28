import { Skeleton } from "@/components/ui/skeleton";

// Loading component for the Suspense fallback
export function BillingLoadingState() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Billing</h1>
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  );
}
