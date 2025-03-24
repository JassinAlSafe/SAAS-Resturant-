"use client";

import { useState, useCallback, Suspense } from "react";
import { Loader2, Receipt, FileBarChart2, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Add SalesPageData type
interface SalesPageData {
  sales: Array<{ id: string; date: string; total_amount: number }>;
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

  const handleSalesDataUpdate = useCallback(
    (data: {
      sales: Array<{ id: string; date: string; total_amount: number }>;
    }) => {
      setSalesData((prev) => {
        // Only update if the data has actually changed
        if (JSON.stringify(prev.sales) !== JSON.stringify(data.sales)) {
          return data;
        }
        return prev;
      });
    },
    []
  );

  return (
    <div className="h-full flex-1">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileBarChart2 className="h-6 w-6 text-primary" />
              </div>
              {activeTab === "daily" && salesData.sales.length > 0 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-2 -right-2 bg-primary text-[11px] text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center font-medium"
                >
                  {salesData.sales.length > 99 ? "99+" : salesData.sales.length}
                </motion.div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                Sales Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Record and analyze your restaurant&apos;s sales data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {salesData.sales.length > 0 && (
              <div className="text-sm text-muted-foreground hidden md:block">
                Showing data for {salesData.sales.length}{" "}
                {salesData.sales.length === 1 ? "sale" : "sales"}
              </div>
            )}

            <Tabs
              defaultValue="daily"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-auto"
            >
              <TabsList className="bg-slate-100/80 dark:bg-slate-800/50 rounded-full p-0.5">
                <TabsTrigger
                  value="daily"
                  className="rounded-full py-1.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Daily Sales
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-full py-1.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center gap-1.5"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  Sales History
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
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
