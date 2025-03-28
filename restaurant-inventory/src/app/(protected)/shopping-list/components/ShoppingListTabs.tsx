"use client";

import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  ListFilter,
  ClipboardCheck,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";

interface ShoppingListTabsProps {
  activeTab?: string;
  onTabChange: (tab: string) => void;
}

export function ShoppingListTabs({
  activeTab,
  onTabChange,
}: ShoppingListTabsProps) {
  const tabs = [
    {
      name: "All Items",
      value: "all",
      icon: <ShoppingCart className="h-5 w-5" />,
      active: activeTab === "all" || !activeTab,
    },
    {
      name: "Pending",
      value: "pending",
      icon: <ListFilter className="h-5 w-5" />,
      active: activeTab === "pending",
    },
    {
      name: "Purchased",
      value: "purchased",
      icon: <ClipboardCheck className="h-5 w-5" />,
      active: activeTab === "purchased",
    },
    {
      name: "Urgent",
      value: "urgent",
      icon: <AlertTriangle className="h-5 w-5" />,
      active: activeTab === "urgent",
    },
    {
      name: "Add New",
      value: "add",
      icon: <PlusCircle className="h-5 w-5" />,
      active: activeTab === "add",
    },
  ];

  return (
    <div className="flex items-center border-b border-gray-100 overflow-x-auto pb-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "flex items-center gap-2 py-2.5 px-4 text-sm font-medium border-b-2 transition-colors",
            tab.active
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-200"
          )}
        >
          {tab.icon}
          <span className="hidden md:inline">{tab.name}</span>
          <span className="md:hidden">
            {tab.name === "All Items"
              ? "All"
              : tab.name === "Add New"
              ? "Add"
              : tab.name}
          </span>
        </button>
      ))}
    </div>
  );
}
