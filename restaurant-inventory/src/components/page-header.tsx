import { Button } from "@/components/ui/button";
import { FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

function RefreshButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={isLoading}
        className="h-9 px-3 font-medium"
      >
        <FiRefreshCw
          className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
        />
        Refresh
      </Button>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  onRefresh,
  isLoading = false,
  actions,
  className,
}: PageHeaderProps) {
  const today = new Date();
  const formattedDate = `${format(today, "EEEE")}, ${format(today, "MMMM d")}`;

  return (
    <div
      className={cn(
        "py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        ) : (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <CalendarIcon className="mr-1 h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 justify-end">
        {actions}
        {onRefresh && (
          <RefreshButton onClick={onRefresh} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
