"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { Loader2, Receipt } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

// Add SalesPageProps type
interface SalesPageData {
  sales: Array<{ id: string; date: string; total: number }>;
}

// Dynamically import the components to improve initial page load performance
const SalesPage = dynamic(() => import("./components/SalesPage"), {
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

const SalesHistoryView = dynamic(
  () => import("./components/SalesHistoryView"),
  {
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [salesData, setSalesData] = useState<SalesPageData>({ sales: [] });

  const handleSalesDataUpdate = useCallback((data: SalesPageData) => {
    setSalesData((prev) => {
      // Only update if the data has actually changed
      if (JSON.stringify(prev.sales) !== JSON.stringify(data.sales)) {
        return data;
      }
      return prev;
    });
  }, []);

  return (
    <div className="h-full flex-1">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-primary rounded-xl">
                <Receipt className="h-6 w-6 text-primary-foreground" />
              </div>
              {activeTab === "daily" && salesData.sales.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-primary text-[11px] text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {salesData.sales.length > 99 ? "99+" : salesData.sales.length}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Sales Management
              </h1>
              <p className="text-muted-foreground">
                Record and analyze your restaurant\'s sales data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-muted-foreground">
              Showing data for {salesData.sales.length}{" "}
              {salesData.sales.length === 1 ? "sale" : "sales"}
            </div>

            <Tabs
              defaultValue="daily"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-auto"
            >
              <TabsList className="bg-slate-100/80 rounded-full p-0.5">
                <TabsTrigger
                  value="daily"
                  className="rounded-full py-1.5 px-4 text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                >
                  Daily Sales
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-full py-1.5 px-4 text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                >
                  Sales History
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-5rem)]">
        {activeTab === "daily" ? (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <SalesPage
              onViewHistory={() => setActiveTab("history")}
              onDataUpdate={handleSalesDataUpdate}
            />
          </Suspense>
        ) : (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <SalesHistoryView />
          </Suspense>
        )}
      </main>
    </div>
  );
}
