import { Skeleton } from "@/components/ui/skeleton";
import Card from "@/components/Card";

export default function InventoryLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36 mt-4 md:mt-0" />
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full md:w-48" />
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <Skeleton className="h-8 w-full mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-2" />
          ))}
        </div>
      </Card>
    </div>
  );
}
