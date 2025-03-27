"use client";

import { cn } from "@/lib/utils";
import {
  FiPackage,
  FiCreditCard,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";

interface BillingTabsProps {
  activeTab?: string;
  onTabChange: (tab: string) => void;
}

export function BillingTabs({ activeTab, onTabChange }: BillingTabsProps) {
  const tabs = [
    {
      name: "Subscription",
      value: "subscription",
      icon: <FiPackage className="h-4 w-4" />,
      active: activeTab === "subscription" || !activeTab,
    },
    {
      name: "Payment Methods",
      value: "payment-methods",
      icon: <FiCreditCard className="h-4 w-4" />,
      active: activeTab === "payment-methods",
    },
    {
      name: "Billing History",
      value: "billing-history",
      icon: <FiFileText className="h-4 w-4" />,
      active: activeTab === "billing-history",
    },
    {
      name: "Change Plan",
      value: "plans",
      icon: <FiRefreshCw className="h-4 w-4" />,
      active: activeTab === "plans",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center bg-white rounded-xl border-none mb-6 p-1 shadow-sm mx-auto max-w-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all rounded-full mx-1",
            tab.active
              ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
              : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
          )}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.name}</span>
          <span className="sm:hidden">{tab.name.split(" ")[0]}</span>
        </button>
      ))}
    </div>
  );
}
