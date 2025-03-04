"use client";

import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { CurrencySelector } from "@/components/currency-selector";
import { PageHeaderProps } from "../types";
import { CalendarIcon, FilterIcon } from "lucide-react";

export const PageHeader = ({
  activeTab,
  setActiveTab,
  handleExportReport,
}: PageHeaderProps) => (
  <div className="flex flex-col space-y-4 md:space-y-0 mb-8">
    {/* Title and Search Row */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View insights and performance metrics for your business
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-muted flex items-center gap-1.5 text-muted-foreground"
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>This Month</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-muted flex items-center gap-1.5 text-muted-foreground"
        >
          <FilterIcon className="h-3.5 w-3.5" />
          <span>Filter</span>
        </Button>
      </div>
    </div>

    {/* Controls Row */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant={activeTab === "sales" ? "default" : "ghost"}
          className={`h-9 px-4 rounded-md text-sm font-medium ${
            activeTab === "sales"
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : ""
          }`}
          onClick={() => setActiveTab("sales")}
        >
          Sales Analytics
        </Button>
        <Button
          variant={activeTab === "inventory" ? "ghost" : "ghost"}
          className={`h-9 px-4 rounded-md text-sm font-medium ${
            activeTab === "inventory"
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : ""
          }`}
          onClick={() => setActiveTab("inventory")}
        >
          Inventory Usage
        </Button>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <CurrencySelector />
        <ExportButton
          onExport={handleExportReport}
          label="Export"
          tooltipText={`Export ${
            activeTab === "sales" ? "sales" : "inventory"
          } report to Excel`}
          variant="outline"
          className="h-9 rounded-lg border-muted"
        />
      </div>
    </div>
  </div>
);
