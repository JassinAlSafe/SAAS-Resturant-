import { Skeleton } from "@/components/ui/skeleton";

export default function StatsSkeleton() {
  // Create an array of 4 items for the skeleton layout
  const skeletons = Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  ));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {skeletons}
    </div>
  );
}
