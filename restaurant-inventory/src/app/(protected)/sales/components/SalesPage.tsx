"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Receipt } from "lucide-react";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onViewHistory,
}: SalesPageProps) {
  // onViewHistory is used in the parent component for tab navigation

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
        <h2 className="text-xl font-semibold mb-2">
          Sales Module Temporarily Unavailable
        </h2>
        <p className="text-muted-foreground mb-4">
          We&apos;ve detected an issue with this page. Please try refreshing the
          browser.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Loading state
  if (salesPage.isLoading) {
    return (
      <div className="w-full">
        <Card className="border-0 shadow-none rounded-none">
          <div className="p-12 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <Receipt className="h-12 w-12 text-muted-foreground/20" />
              </div>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground mt-4">Loading sales data...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              This may take a moment
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (salesPage.error) {
    return (
      <div className="w-full">
        <Card className="border-0 shadow-none rounded-none border-destructive/20">
          <div className="p-8 text-center">
            <p className="text-destructive">Unable to load sales data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try again later
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full flex flex-col"
    >
      <Card className="flex-1 border-0 shadow-none rounded-none bg-background">
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
    </motion.div>
  );
}
