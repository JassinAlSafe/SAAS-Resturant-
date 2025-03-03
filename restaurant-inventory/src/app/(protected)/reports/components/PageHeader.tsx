"use client";

import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { CurrencySelector } from "@/components/currency-selector";
import { PageHeaderProps } from "../types";

export const PageHeader = ({
  activeTab,
  setActiveTab,
  handleExportReport,
}: PageHeaderProps) => (
  <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
        Reports & Analytics
      </h1>
      <p className="text-xs md:text-sm text-muted-foreground">
        View insights and performance metrics
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <CurrencySelector />
        <ExportButton
          onExport={handleExportReport}
          label="Export Report"
          tooltipText={`Export ${
            activeTab === "sales" ? "sales" : "inventory"
          } report to Excel`}
          variant="outline"
        />
      </div>

      <div className="flex w-full sm:w-auto mt-2 sm:mt-0">
        <Button
          variant={activeTab === "sales" ? "default" : "ghost"}
          className="flex-1 sm:flex-none rounded-l-md rounded-r-none py-1 px-3 text-sm"
          onClick={() => setActiveTab("sales")}
        >
          Sales Analytics
        </Button>
        <Button
          variant={activeTab === "inventory" ? "default" : "ghost"}
          className="flex-1 sm:flex-none rounded-l-none rounded-r-md py-1 px-3 text-sm"
          onClick={() => setActiveTab("inventory")}
        >
          Inventory Usage
        </Button>
      </div>
    </div>
  </div>
);
