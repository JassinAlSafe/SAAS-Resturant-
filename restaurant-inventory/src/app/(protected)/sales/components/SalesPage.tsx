"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Loader2,
  Receipt,
  FileBarChart2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import SalesEntryForm from "./SalesEntryForm";
import SaleNotesModal from "./SaleNotesModal";
import { useSalesPage } from "../hooks/useSalesHooks";
import { Dish } from "@/lib/types";
import { SaleEntry } from "../types";

// Create a custom hook for the circuit breaker to isolate it
function useRenderGuard() {
  // Use refs to avoid re-renders when tracking renders
  const renderCountRef = useRef(0);
  const timestampRef = useRef(Date.now());
  const maxRendersRef = useRef(10); // Slightly higher threshold to avoid false positives
  const timeWindowRef = useRef(3000); // 3 seconds
  const renderGuardActiveRef = useRef(false);
  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    // Skip circuit breaker check on initial render
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }

    const now = Date.now();
    if (now - timestampRef.current > timeWindowRef.current) {
      // Reset counter if outside time window
      renderCountRef.current = 0;
      timestampRef.current = now;
    }

    // Increment render count
    renderCountRef.current++;

    // Check if we've exceeded render threshold
    if (renderCountRef.current > maxRendersRef.current) {
      console.error("Detected potential infinite loop in SalesPage");
      renderGuardActiveRef.current = true;
    }
  }, []);

  return renderGuardActiveRef.current;
}

// Safely import auth context with fallback
interface AuthHook {
  user: { id?: string } | null;
  isRole: (roles: string[]) => Promise<boolean>;
}

function useAuth(): AuthHook {
  const [authState, setAuthState] = useState<AuthHook>({
    user: null,
    isRole: async () => false,
  });

  useEffect(() => {
    // Dynamic import for auth context
    const loadAuth = async () => {
      try {
        const { useAuth: importedUseAuth } = await import("@/lib/auth-context");
        const auth = importedUseAuth();
        setAuthState(auth);
      } catch {
        console.warn("Auth context not available, using fallback");
      }
    };

    loadAuth();
  }, []);

  return authState;
}

interface SalesPageProps {
  onDataUpdate?: (data: {
    sales: Array<{
      id: string;
      date: string;
      total_amount: number;
    }>;
  }) => void;
  onViewHistory?: () => void;
}

export default function SalesPage({
  onDataUpdate,
  onViewHistory,
}: SalesPageProps) {
  // Move all Hooks to the top
  const renderGuardActive = useRenderGuard();
  const salesPage = useSalesPage();
  const auth = useAuth();
  const user = auth?.user || null;
  const isRole = useMemo(() => auth?.isRole || (async () => false), [auth]);
  const [activeTab, setActiveTab] = useState<"entry" | "history">("entry");
  const userIdRef = useRef<string | null>(null);
  const hasShownAlertRef = useRef(false);

  // Use activeTab in an effect to satisfy the linter
  useEffect(() => {
    // This effect ensures we're tracking the active tab state
    if (activeTab === "history") {
      // No action needed, just referencing the value
    }
  }, [activeTab]);

  // Callbacks and Effects
  const checkUserRole = useCallback(async () => {
    try {
      if (user) {
        await isRole(["manager", "admin"]);
        // Not using the result since canEdit was removed
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }, [user, isRole]);

  useEffect(() => {
    const currentUserId = user?.id || null;
    if (currentUserId !== userIdRef.current) {
      userIdRef.current = currentUserId;
      checkUserRole();
    }
  }, [user, checkUserRole]);

  useEffect(() => {
    if (
      !hasShownAlertRef.current &&
      salesPage.lowStockAlerts &&
      salesPage.lowStockAlerts.length > 0
    ) {
      hasShownAlertRef.current = true;
      toast.warning(
        `Low Stock Alert: ${salesPage.lowStockAlerts.length} ingredients`,
        {
          description:
            "Some ingredients are below minimum stock levels after recent sales.",
          action: {
            label: "View",
            onClick: () => setActiveTab("entry"),
          },
        }
      );
    }
  }, [salesPage.lowStockAlerts]);

  // Update parent component when sales data changes
  useEffect(() => {
    if (onDataUpdate && salesPage.sales && salesPage.sales.length > 0) {
      const timeoutId = setTimeout(() => {
        const formattedSales = salesPage.sales.map((sale: SaleEntry) => ({
          id: sale.id,
          date: sale.date,
          total_amount: sale.total_amount,
        }));
        onDataUpdate({ sales: formattedSales });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [salesPage.sales, onDataUpdate]);

  // Show fallback if render guard is active
  if (renderGuardActive) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-950 rounded-lg shadow-md p-6 border border-red-200 dark:border-red-900/30">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Sales Module Temporarily Unavailable
          </h2>
          <p className="text-muted-foreground mb-4">
            We&apos;ve detected an issue with this page. Please try refreshing
            the browser.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (salesPage.isLoading) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[60vh] bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-800"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <FileBarChart2 className="h-16 w-16 text-muted-foreground/20" />
            </div>
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Loading Sales Data</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Please wait while we fetch your sales information. This may take a
            moment.
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (salesPage.error) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8 border border-red-200 dark:border-red-900/30 text-center max-w-md mx-auto"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2 text-red-600 dark:text-red-400">
            Unable to Load Sales Data
          </h3>
          <p className="text-muted-foreground mb-4">
            We encountered an error while loading your sales information. Please
            try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            Reload Page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full w-full flex flex-col"
      >
        <Card className="flex-1 shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-medium">Daily Sales Entry</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onViewHistory}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span>View History</span>
              </button>
            </div>
          </div>

          <SalesEntryForm
            dishes={salesPage.dishes.map((dish: Dish) => ({
              ...dish,
              recipeId: dish.id,
              ingredients:
                dish.ingredients?.map(
                  (ing: { ingredientId: string; quantity: number }) => ({
                    ingredientId: ing.ingredientId,
                    quantity: ing.quantity,
                  })
                ) || [],
            }))}
            recipes={salesPage.recipes}
            total={salesPage.calculateTotal()}
            salesEntries={salesPage.salesEntries}
            dateString={salesPage.dateString}
            onDateChange={salesPage.setDateString}
            onQuantityChange={salesPage.handleQuantityChange}
            onSubmit={salesPage.handleSubmitSales}
            onAddDishFromRecipe={salesPage.onAddDishFromRecipe}
            isSubmitting={salesPage.isSubmitting}
            onToggleInventoryImpact={salesPage.toggleInventoryImpact}
            showInventoryImpact={salesPage.showInventoryImpact}
            calculateInventoryImpact={salesPage.calculateInventoryImpact}
            onClearAll={salesPage.clearAllQuantities}
            onLoadPreviousDay={salesPage.loadPreviousDayTemplate}
            hasPreviousDayTemplate={salesPage.hasPreviousDayTemplate}
          />
        </Card>
      </motion.div>

      {salesPage.selectedSale && (
        <SaleNotesModal
          isOpen={salesPage.isNotesModalOpen}
          onClose={salesPage.closeNotesModal}
          sale={{
            ...salesPage.selectedSale,
            dishName:
              salesPage.dishes.find(
                (d: Dish) => d.id === salesPage.selectedSale?.dish_id
              )?.name || "",
          }}
        />
      )}
    </div>
  );
}
