"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Card from "@/components/Card";
import SaleNotesModal from "@/components/sales/SaleNotesModal";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Import auth context with error handling
import SalesHeader from "./components/SalesHeader";
import SalesFilter from "./components/SalesFilter";
import SalesTable from "./components/SalesTable";
import SalesEntryForm from "./components/SalesEntryForm";
import { Loader2, Receipt } from "lucide-react";
import { useSalesPage } from "./hooks/useSalesHooks";

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

let useAuth: () => AuthHook = () => ({ user: null, isRole: async () => false });
try {
  // Dynamic import for auth context
  const { useAuth: importedUseAuth } = await import("@/lib/auth-context");
  useAuth = importedUseAuth;
} catch {
  console.warn("Auth context not available, using fallback");
}

export default function SalesPage() {
  // Move all Hooks to the top
  const renderGuardActive = useRenderGuard();
  const salesPage = useSalesPage();
  const auth = useAuth();
  const user = auth?.user || null;
  const isRole = useMemo(() => auth?.isRole || (async () => false), [auth]);
  const [canEdit, setCanEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"entry" | "history">("entry");
  const userIdRef = useRef<string | null>(null);
  const hasShownAlertRef = useRef(false);

  // Callbacks and Effects
  const checkUserRole = useCallback(async () => {
    try {
      if (user) {
        const hasRole = await isRole(["manager", "admin"]);
        setCanEdit(hasRole);
      } else {
        setCanEdit(false);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setCanEdit(false);
    }
  }, [user, isRole]);

  const handleViewReports = useCallback(() => {
    toast("Coming soon", {
      description: "Sales reports feature is under development.",
    });
  }, []);

  const handleViewHistory = useCallback(() => {
    setActiveTab("history");
  }, []);

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
      <div className="w-full py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <SalesHeader
            totalSales={salesPage.sales.length}
            isLoading={salesPage.isLoading}
          />
          <div className="mt-2 md:mt-0">
            <div className="h-9 w-[200px] bg-muted/50 animate-pulse rounded-md" />
          </div>
        </div>
        <Card className="border border-muted/30">
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
      <div className="w-full py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <SalesHeader totalSales={salesPage.sales.length} />
        </div>
        <Card className="border-destructive/20">
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
      className="w-full py-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <SalesHeader
          totalSales={salesPage.sales.length}
          isLoading={salesPage.isLoading}
          onViewReports={handleViewReports}
          onViewHistory={handleViewHistory}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as "entry" | "history")
        }
        className="space-y-6"
      >
        <div className="border-b mb-6">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger
              value="entry"
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Sales Entry
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Sales History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="entry" className="mt-0">
          <Card className="border shadow-sm">
            <SalesEntryForm
              dishes={salesPage.dishes.map((dish) => ({
                ...dish,
                recipeId: dish.id, // Using dish.id as recipeId since they represent the same entity
                ingredients: dish.ingredients.map((ing) => ({
                  ingredientId: ing.ingredientId,
                  quantity: ing.quantity,
                })),
              }))}
              recipes={salesPage.recipes}
              salesEntries={salesPage.salesEntries}
              dateString={salesPage.dateString}
              onDateChange={salesPage.setDateString}
              onQuantityChange={salesPage.handleQuantityChange}
              onSubmit={salesPage.handleSubmitSales}
              onAddDishFromRecipe={salesPage.onAddDishFromRecipe}
              total={salesPage.calculateTotal()}
              isSubmitting={salesPage.isSubmitting}
              onToggleInventoryImpact={salesPage.toggleInventoryImpact}
              showInventoryImpact={salesPage.showInventoryImpact}
              calculateInventoryImpact={salesPage.calculateInventoryImpact}
              onClearAll={salesPage.clearAllQuantities}
              onLoadPreviousDay={salesPage.loadPreviousDayTemplate}
              hasPreviousDayTemplate={salesPage.hasPreviousDayTemplate}
            />
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="border shadow-sm">
            <div className="p-6">
              <div className="mb-6">
                <SalesFilter
                  searchTerm={salesPage.searchTerm}
                  onSearchChange={salesPage.setSearchTerm}
                  selectedDate={salesPage.filterDate}
                  onDateChange={salesPage.setFilterDate}
                  onResetFilters={salesPage.resetFilters}
                />
              </div>

              {salesPage.filteredSales.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="p-4 rounded-full bg-muted w-fit mx-auto">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">
                        No sales records found
                      </p>
                      <p className="text-sm text-muted-foreground/80 mt-1">
                        Try adjusting your filters or clearing the search
                      </p>
                    </div>
                    <button
                      onClick={salesPage.resetFilters}
                      className="text-sm text-primary hover:text-primary/90 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border bg-background">
                  <SalesTable
                    sales={salesPage.filteredSales}
                    onViewNotes={salesPage.openNotesModal}
                    onRefresh={salesPage.fetchSalesAndDishes}
                    canEdit={canEdit}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {salesPage.selectedSale && (
        <SaleNotesModal
          isOpen={salesPage.isNotesModalOpen}
          onClose={salesPage.closeNotesModal}
          sale={salesPage.selectedSale}
        />
      )}
    </motion.div>
  );
}
