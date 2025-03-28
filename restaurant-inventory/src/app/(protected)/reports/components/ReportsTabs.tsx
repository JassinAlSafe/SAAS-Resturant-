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
    <div className="flex flex-wrap justify-center bg-white rounded-xl border border-gray-100 shadow-sm p-1.5 mx-auto max-w-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => onTabChange(tab.value as TabType)}
          className={cn(
            "flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-all rounded-full mx-1",
            tab.active
              ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
              : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
          )}
        >
          {tab.icon}
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );
}
