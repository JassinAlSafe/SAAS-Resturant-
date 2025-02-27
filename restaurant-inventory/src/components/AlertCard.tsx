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

export default AlertCard;
