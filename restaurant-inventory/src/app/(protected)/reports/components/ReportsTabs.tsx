"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, BarChart2, PackageSearch } from "lucide-react";
import { TabType } from "../types";

interface ReportsTabsProps {
  activeTab?: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ReportsTabs({ activeTab, onTabChange }: ReportsTabsProps) {
  const tabs = [
    {
      name: "Executive",
      value: "executive",
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: activeTab === "executive" || !activeTab,
    },
    {
      name: "Sales",
      value: "sales",
      icon: <BarChart2 className="h-4 w-4" />,
      active: activeTab === "sales",
    },
    {
      name: "Inventory",
      value: "inventory",
      icon: <PackageSearch className="h-4 w-4" />,
      active: activeTab === "inventory",
    },
  ];

  return (
    <div className="flex w-full max-w-lg bg-muted/30 rounded-lg p-1 mx-auto mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => onTabChange(tab.value as TabType)}
          className={cn(
            "flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all rounded-md flex-1",
            tab.active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {tab.icon}
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );
}
