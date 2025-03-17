import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/hooks/useDashboard";

export function SalesTab() {
  const router = useRouter();
  const { salesData, isLoading, refreshData, formattedValues } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-xl border shadow-xs p-6">
          <div className="h-6 w-1/3 bg-muted/70 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/70 rounded"></div>
            <div className="h-4 w-2/3 bg-muted/70 rounded"></div>
            <div className="h-4 w-5/6 bg-muted/70 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border shadow-xs p-6">
            <div className="h-6 w-1/2 bg-muted/70 rounded mb-4"></div>
            <div className="h-36 bg-muted/50 rounded"></div>
          </div>
          <div className="bg-card rounded-xl border shadow-xs p-6">
            <div className="h-6 w-1/2 bg-muted/70 rounded mb-4"></div>
            <div className="h-36 bg-muted/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sales Overview</h2>
        <Button onClick={refreshData} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      {/* Monthly Sales Summary */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Monthly Sales</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Current Month</p>
            <p className="text-2xl font-semibold">
              {formattedValues.monthlySales}
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Growth</p>
            <div className="flex items-center">
              <p className="text-2xl font-semibold">
                {formattedValues.salesGrowth}
              </p>
              <span
                className={`ml-2 text-sm ${
                  parseFloat(formattedValues.salesGrowth) > 0
                    ? "text-green-600"
                    : parseFloat(formattedValues.salesGrowth) < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                vs last month
              </span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Average Transaction</p>
            <p className="text-2xl font-semibold">
              {salesData.length > 0 ? formattedValues.monthlySales : "$0.00"}
            </p>
          </div>
        </div>

        {/* Sales Chart Placeholder */}
        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Monthly Sales Chart</p>
            <div className="flex mt-2 justify-center space-x-2">
              {salesData.map((item, i) => (
                <div
                  key={i}
                  className="w-8 bg-primary rounded-t-sm"
                  style={{
                    height: `${Math.max(
                      20,
                      (item.sales /
                        (Math.max(...salesData.map((d) => d.sales)) || 1)) *
                        100
                    )}px`,
                  }}
                ></div>
              ))}
            </div>
            <div className="flex mt-1 justify-center space-x-2">
              {salesData.map((item, i) => (
                <div key={i} className="w-8 text-xs text-muted-foreground">
                  {item.month}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Sales History Link */}
      <div className="text-center">
        <Button onClick={() => router.push("/sales/history")} variant="default">
          View Full Sales History
        </Button>
      </div>
    </div>
  );
}
