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
    <div className="tabs tabs-boxed bg-base-200 rounded-lg mb-6 p-1">
      <div className="flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "tab flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              tab.active
                ? "tab-active bg-base-100 text-primary"
                : "text-base-content/70 hover:text-base-content"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.name}</span>
            <span className="sm:hidden">{tab.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
