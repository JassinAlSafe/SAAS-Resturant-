import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StockAlert } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// Props for individual alert items
interface AlertItemProps {
  title: string;
  description: string;
  category: string;
  severity: "high" | "medium" | "low";
  className?: string;
}

// Props for the main AlertCard component
export interface AlertCardProps {
  title: string;
  alerts?: StockAlert[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Individual alert item component
const AlertItem = ({
  title,
  description,
  category,
  severity,
  className = "",
}: AlertItemProps) => {
  const getSeverityColor = () => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-amber-50 border-amber-200";
      case "low":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getSeverityTextColor = () => {
    switch (severity) {
      case "high":
        return "text-red-700";
      case "medium":
        return "text-amber-700";
      case "low":
        return "text-blue-700";
      default:
        return "text-slate-700";
    }
  };

  const getSeverityBadgeColor = () => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-lg border",
        getSeverityColor(),
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={cn("font-medium", getSeverityTextColor())}>{title}</h3>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            getSeverityBadgeColor()
          )}
        >
          {category}
        </span>
      </div>
    </div>
  );
};

// Main AlertCard component
const AlertCard = ({
  title,
  alerts = [],
  isLoading = false,
  onRefresh,
}: AlertCardProps) => {
  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-9 rounded" />
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        {onRefresh && (
          <Button size="sm" variant="ghost" onClick={onRefresh}>
            <FiRefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                title={alert.name}
                description={`Current stock: ${alert.currentStock} ${alert.unit} (Min: ${alert.minStock} ${alert.unit})`}
                category={alert.category}
                severity={
                  alert.currentStock < alert.minStock / 2 ? "high" : "medium"
                }
              />
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FiAlertTriangle className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p>No low stock alerts at this time.</p>
              <p className="text-sm mt-1">
                All inventory items are above their reorder levels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
