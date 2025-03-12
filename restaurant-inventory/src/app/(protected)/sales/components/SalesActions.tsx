"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, History } from "lucide-react";

interface SalesActionsProps {
  onViewReports?: () => void;
  onViewHistory?: () => void;
}

const SalesActions: React.FC<SalesActionsProps> = ({
  onViewReports,
  onViewHistory,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onViewReports}
        className="flex items-center gap-1.5"
      >
        <BarChart3 className="h-4 w-4" />
        <span>View Reports</span>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onViewHistory}
        className="flex items-center gap-1.5"
      >
        <History className="h-4 w-4" />
        <span>View History</span>
      </Button>
    </div>
  );
};

export default SalesActions;
