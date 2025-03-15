"use client";

import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { CurrencySelector } from "@/components/currency-selector";
import { PageHeaderProps } from "../types";
import { DateRangeSelector } from "./DateRangeSelector";

export const PageHeader = ({
  activeTab,
  setActiveTab,
  handleExportReport,
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
}: PageHeaderProps) => (
  <div className="flex flex-col space-y-6">
    {/* Title Row with improved alignment and spacing */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
          Business Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Track your business performance and make data-driven decisions
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <CurrencySelector />
        <div className="min-w-[120px]">
          <ExportButton
            onExport={handleExportReport}
            label="Export Report"
            variant="outline"
          />
        </div>
      </div>
    </div>

    {/* Controls Section with consistent spacing */}
    <div className="bg-card rounded-lg p-4 shadow-xs border border-border/40">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
        <nav
          role="tablist"
          aria-label="Report Sections"
          className="flex items-center gap-2"
        >
          <Button
            variant={activeTab === "sales" ? "default" : "ghost"}
            className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "sales"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted"
            }`}
            onClick={() => setActiveTab("sales")}
            role="tab"
            aria-selected={activeTab === "sales"}
            aria-controls="sales-panel"
          >
            Sales Analytics
          </Button>
          <Button
            variant={activeTab === "inventory" ? "default" : "ghost"}
            className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "inventory"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted"
            }`}
            onClick={() => setActiveTab("inventory")}
            role="tab"
            aria-selected={activeTab === "inventory"}
            aria-controls="inventory-panel"
          >
            Inventory Usage
          </Button>
        </nav>

        {/* Date Range Selector with proper spacing */}
        <div className="flex-1 flex sm:justify-end">
          <DateRangeSelector
            dateRange={dateRange}
            setDateRange={setDateRange}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
          />
        </div>
      </div>
    </div>
  </div>
);
