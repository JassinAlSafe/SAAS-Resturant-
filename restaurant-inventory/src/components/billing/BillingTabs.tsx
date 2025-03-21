"use client";

import { cn } from "@/lib/utils";
import { FiPackage, FiCreditCard, FiFileText, FiRefreshCw } from "react-icons/fi";

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
      active: activeTab === "subscription" || !activeTab
    },
    {
      name: "Payment Methods",
      value: "payment-methods",
      icon: <FiCreditCard className="h-4 w-4" />,
      active: activeTab === "payment-methods"
    },
    {
      name: "Billing History",
      value: "billing-history",
      icon: <FiFileText className="h-4 w-4" />,
      active: activeTab === "billing-history"
    },
    {
      name: "Change Plan",
      value: "plans",
      icon: <FiRefreshCw className="h-4 w-4" />,
      active: activeTab === "plans"
    }
  ];

  return (
    <div className="w-full overflow-hidden border rounded-lg mb-6 bg-card">
      <div className="flex flex-wrap w-full">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors",
              tab.active
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
