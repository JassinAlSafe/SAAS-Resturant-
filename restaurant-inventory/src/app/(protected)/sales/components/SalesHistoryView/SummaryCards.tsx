import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  isLoading: boolean;
  totalSales: number;
  totalOrders: number;
  formatCurrency: (value: number) => string;
}

export function SummaryCards({
  isLoading,
  totalSales,
  totalOrders,
  formatCurrency,
}: SummaryCardsProps) {
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        label="Total Sales"
        value={formatCurrency(totalSales)}
        isLoading={isLoading}
        skeletonWidth="w-24"
      />
      <MetricCard
        label="Total Orders"
        value={totalOrders.toString()}
        isLoading={isLoading}
        skeletonWidth="w-16"
      />
      <MetricCard
        label="Average Order Value"
        value={formatCurrency(averageOrderValue)}
        isLoading={isLoading}
        skeletonWidth="w-24"
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  isLoading: boolean;
  skeletonWidth: string;
}

function MetricCard({
  label,
  value,
  isLoading,
  skeletonWidth,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      {isLoading ? (
        <Skeleton className={`h-8 ${skeletonWidth} mt-2`} />
      ) : (
        <div className="text-2xl font-bold mt-2">{value}</div>
      )}
    </div>
  );
}
