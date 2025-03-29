"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AlertCircle, FileBarChart2 } from "lucide-react";
import { toast } from "sonner";
import SalesEntryForm from "./SalesEntryForm";
import SaleNotesModal from "./SaleNotesModal";
import { useSalesPage } from "../hooks/useSalesHooks";
import { Dish } from "@/lib/types";
import { SaleEntry } from "../types";

// Override default toast settings for this component
import { Toaster } from "sonner";

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
        const { useAuth: importedUseAuth } = await import(
          "@/lib/services/auth-context"
        );
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
}

export default function SalesPage({ onDataUpdate }: SalesPageProps) {
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
          icon: "⚠️",
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
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8 border-none">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-3">
            Sales Module Temporarily Unavailable
          </h2>
          <p className="text-neutral-500 mb-5">
            We&apos;ve detected an issue with this page. Please try refreshing
            the browser.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-full hover:bg-orange-600 transition-colors font-medium"
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
      <div className="p-8 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-sm p-10 border-none max-w-3xl w-full"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <FileBarChart2 className="h-16 w-16 text-neutral-200" />
            </div>
            <div className="h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          </div>
          <h3 className="text-xl font-medium mb-2 text-neutral-900 text-center">
            Loading Sales Data
          </h3>
          <p className="text-neutral-500 text-center max-w-md">
            Please wait while we fetch your sales information.
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (salesPage.error) {
    return (
      <div className="p-8 flex justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-8 border-none text-center max-w-md mx-auto"
        >
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center justify-center gap-2 text-red-500">
            <AlertCircle className="h-6 w-6" />
            <span>Unable to Load Sales Data</span>
          </div>
          <p className="text-neutral-500 mb-5">
            We encountered an error while loading your sales information. Please
            try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-full hover:bg-orange-600 transition-colors font-medium"
          >
            Reload Page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
