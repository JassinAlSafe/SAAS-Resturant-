import { FiAlertTriangle, FiCheckCircle, FiExternalLink } from "react-icons/fi";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  title: string;
  description: string;
  category: string;
  severity: "high" | "medium" | "low";
  className?: string;
}

const AlertCard = ({
  title,
  description,
  category,
  severity,
  className = "",
}: AlertCardProps) => {
  const getSeverityColor = () => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
      case "medium":
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
      case "low":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800";
      default:
        return "bg-secondary border-border";
    }
  };

  const getSeverityTextColor = () => {
    switch (severity) {
      case "high":
        return "text-red-700 dark:text-red-400";
      case "medium":
        return "text-amber-700 dark:text-amber-400";
      case "low":
        return "text-blue-700 dark:text-blue-400";
      default:
        return "text-foreground";
    }
  };

  const getSeverityBadgeColor = () => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-secondary text-secondary-foreground";
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
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
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

export default AlertCard;
