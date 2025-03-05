"use client";

import { useState } from "react";
import { useSales } from "./hooks/useSales";
import { useSalesEntry } from "./hooks/useSalesEntry";
import { useSaleNotes } from "./hooks/useSaleNotes";
import { useSalesFilter } from "./hooks/useSalesFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Card from "@/components/Card";
import SaleNotesModal from "@/components/sales/SaleNotesModal";

import SalesHeader from "./components/SalesHeader";
import SalesActions from "./components/SalesActions";
import SalesFilter from "./components/SalesFilter";
import SalesTable from "./components/SalesTable";
import SalesEntryForm from "./components/SalesEntryForm";
import { useNotificationHelpers } from "@/lib/notification-context";

export default function SalesPage() {
  // Use our custom hooks
  const {
    sales,
    dishes,
    isLoading,
    error,
    fetchSalesAndDishes,
    fetchSalesByDate,
    addSalesEntries,
    calculateInventoryImpact,
  } = useSales();

  // Get notification helpers
  const { error: showError } = useNotificationHelpers();

  // Active tab state
  const [activeTab, setActiveTab] = useState<"entry" | "history">("entry");

  // Sales entry form hook
  const {
    salesEntries,
    selectedDate,
    dateString,
    setDateString,
    isSubmitting,
    setIsSubmitting,
    showInventoryImpact,
    handleQuantityChange,
    calculateTotal,
    toggleInventoryImpact,
    resetForm,
    loadPreviousDayTemplate,
    hasPreviousDayTemplate,
    clearAllQuantities,
  } = useSalesEntry(dishes);

  // Sales filter hook for history view
  const {
    searchTerm,
    setSearchTerm,
    selectedDate: filterDate,
    setSelectedDate: setFilterDate,
    filteredSales,
    resetFilters,
  } = useSalesFilter(sales, dishes);

  // Notes modal hook
  const { isNotesModalOpen, selectedSale, openNotesModal, closeNotesModal } =
    useSaleNotes();

  // Handle submitting sales entries
  const handleSubmitSales = async () => {
    setIsSubmitting(true);
    try {
      console.log("Starting sales submission process");

      // Validate that we have at least one item with quantity > 0
      const hasItems = Object.values(salesEntries).some((qty) => qty > 0);
      if (!hasItems) {
        showError(
          "No Items to Submit",
          "Please add at least one item with a quantity greater than zero."
        );
        return false;
      }

      // Validate the date
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        showError(
          "Invalid Date",
          "Please select a valid date for the sales entry."
        );
        return false;
      }

      const success = await addSalesEntries(salesEntries, selectedDate);
      if (success) {
        console.log("Sales submitted successfully, resetting form");
        resetForm();
        return true;
      } else {
        console.log("Sales submission failed");
        return false;
      }
    } catch (error) {
      console.error("Error in handleSubmitSales:", error);
      showError(
        "Submission Error",
        "An unexpected error occurred while submitting sales. Please try again."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view reports (placeholder)
  const handleViewReports = () => {
    console.log("View reports");
    // Implementation would go here in a real app
  };

  // Handle switching to history tab
  const handleViewHistory = () => {
    setActiveTab("history");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <SalesHeader />
          <div className="mt-4 md:mt-0">
            <div className="h-9 w-36 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="h-96 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <SalesHeader error={error} retry={fetchSalesAndDishes} />
        <SalesActions
          onViewReports={handleViewReports}
          onViewHistory={handleViewHistory}
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="entry">Sales Entry</TabsTrigger>
          <TabsTrigger value="history">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <SalesEntryForm
            dishes={dishes}
            salesEntries={salesEntries}
            dateString={dateString}
            onDateChange={setDateString}
            onQuantityChange={handleQuantityChange}
            onSubmit={handleSubmitSales}
            total={calculateTotal()}
            isSubmitting={isSubmitting}
            onToggleInventoryImpact={toggleInventoryImpact}
            showInventoryImpact={showInventoryImpact}
            calculateInventoryImpact={calculateInventoryImpact}
            onClearAll={clearAllQuantities}
            onLoadPreviousDay={loadPreviousDayTemplate}
            hasPreviousDayTemplate={hasPreviousDayTemplate}
          />
        </TabsContent>

        <TabsContent value="history">
          <SalesFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDate={filterDate}
            onDateChange={setFilterDate}
          />

          <Card>
            <div className="p-4">
              <SalesTable sales={filteredSales} onViewNotes={openNotesModal} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedSale && (
        <SaleNotesModal
          isOpen={isNotesModalOpen}
          onClose={closeNotesModal}
          sale={selectedSale}
        />
      )}
    </div>
  );
}
