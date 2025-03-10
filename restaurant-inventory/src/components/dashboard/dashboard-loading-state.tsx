import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function DashboardLoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}
