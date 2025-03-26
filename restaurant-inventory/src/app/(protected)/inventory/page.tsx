"use client";

/**
 * Inventory Management Page
 *
 * This page displays and manages the inventory items for a restaurant.
 * It includes features for:
 * - Viewing items in table or card view
 * - Filtering and sorting inventory
 * - Adding, editing and deleting items
 * - Batch operations on multiple items
 * - Quick quantity updates
 */

import { useState, useEffect, useMemo } from "react";
import InventoryHeader from "./components/InventoryHeader";
import { InventoryStats } from "./components/InventoryStats";
import { InventoryFiltersWrapper } from "./components/InventoryFilters";
import InventoryLoading from "./components/InventoryLoading";
import { InventoryModals } from "./components/modals";
import { InventoryContent } from "./components/InventoryContent";
import { BatchOperations } from "@/components/ui/batch-operations/batch-operations";
import { useInventoryManager } from "./hooks/useInventoryStore";
import { useInventoryFilters } from "./hooks/useInventoryFilters";
import { useInventoryModals } from "./hooks/useInventoryModals";
import { useInventoryBatchOperations } from "./hooks/useInventoryBatchOperations";
import { usePermission } from "@/lib/permission-context";
import { useCurrency } from "@/lib/currency";
import { supplierService } from "@/lib/services/supplier-service";
import { Supplier } from "@/lib/types";
import {
  groupInventoryItems,
  isGroupLowStock,
  isGroupOutOfStock,
} from "./utils/inventoryUtils";
import { InventoryFormData } from "./types";

export default function Inventory() {
  const { formatCurrency } = useCurrency();
  const { userRole } = usePermission();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<
    string | undefined
  >(undefined);
  const [categoriesError, setCategoriesError] = useState<string | undefined>(
    undefined
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Ensure component is mounted before using client-side only values
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get inventory items from the store
  const {
    items,
    categories,
    isLoading,
    addItem: addInventoryItem,
    updateItem: updateInventoryItem,
    deleteItem: deleteInventoryItem,
  } = useInventoryManager();

  // Group inventory items
  const groupedItems = useMemo(() => {
    return groupInventoryItems(items);
  }, [items]);

  // Set up filters and sorting
  const {
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    showLowStockOnly,
    setShowLowStockOnly,
    filteredGroupedItems,
    sortedFilteredItems,
  } = useInventoryFilters(groupedItems);

  // Set up modals
  const {
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    currentItem,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  } = useInventoryModals(
    (itemData) => addInventoryItem(itemData as InventoryFormData),
    (id, item) => updateInventoryItem(id, item as InventoryFormData),
    async (id, name) => {
      await deleteInventoryItem(id, name);
      // Return void to match the expected type
      return;
    }
  );

  // Initialize modal states
  useEffect(() => {
    if (!mounted) return;

    // Reset modal states
    closeAddModal();
    closeEditModal();
    closeDeleteModal();
  }, [mounted, closeAddModal, closeEditModal, closeDeleteModal]);

  // Set up batch operations
  const {
    selectedItems,
    toggleItemSelection,
    toggleAllItems,
    clearSelection,
    batchActions,
  } = useInventoryBatchOperations(items, deleteInventoryItem);

  // Calculate inventory statistics - client side only to avoid hydration issues
  const lowStockCount = mounted
    ? groupedItems.filter((item) => isGroupLowStock(item)).length
    : 0;

  const outOfStockCount = mounted
    ? groupedItems.filter((item) => isGroupOutOfStock(item)).length
    : 0;

  // Calculate inventory value on client side only to avoid hydration mismatch
  const totalInventoryValue = useMemo(() => {
    if (!mounted) return 0;
    // Calculate total value based on items, not grouped items
    return items.reduce((total, item) => total + item.cost * item.quantity, 0);
  }, [items, mounted]);

  // Handler for quick quantity updates
  const handleQuickQuantityUpdate = async (
    itemId: string,
    newQuantity: number
  ) => {
    const itemToUpdate = items.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    try {
      await updateInventoryItem(itemId, { quantity: newQuantity });
    } catch (error: unknown) {
      // In a real app, handle this error with a notification or error state
      console.error("Failed to update quantity:", error);
    }
  };

  // Retry functions
  const retryCategories = () => setCategoriesError(undefined);
  const retrySubscription = () => setSubscriptionError(undefined);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (suppliers.length > 0) return;

      try {
        setIsLoadingSuppliers(true);
        const supplierData = await supplierService.getSuppliers();
        setSuppliers(supplierData);
      } catch (error: unknown) {
        // In a real app, handle this error with a notification or error state
        console.error("Failed to fetch suppliers:", error);
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, [suppliers.length]);

  // Mock subscription setup
  useEffect(() => {
    setIsSubscribed(true);
    return () => {}; // Cleanup function
  }, []);

  if (isLoading || isLoadingSuppliers) {
    return <InventoryLoading />;
  }

  return (
    <div className="w-full py-6 space-y-6">
      {/* Header */}
      <InventoryHeader
        categoriesError={categoriesError}
        retryCategories={retryCategories}
        subscriptionError={subscriptionError}
        retrySubscription={retrySubscription}
        isSubscribed={isSubscribed}
      />


      {/* Stats */}
      <InventoryStats
        totalItems={groupedItems?.length || 0}
        lowStockItems={lowStockCount}
        outOfStockItems={outOfStockCount}
        totalValue={totalInventoryValue}
      />

      {/* Filters */}
      <InventoryFiltersWrapper
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        sortField={sortField}
        setSortField={(field: string) => {
          // Use type assertion since we know the field names match
          setSortField(field as typeof sortField);
        }}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        showLowStock={showLowStockOnly}
        onLowStockChange={setShowLowStockOnly}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={openAddModal}
      />

      {/* Inventory Content */}
      <div className="rounded-lg">
        <InventoryContent
          items={items}
          groupedItems={groupedItems}
          filteredGroupedItems={filteredGroupedItems || []}
          sortedFilteredItems={sortedFilteredItems || []}
          viewMode={viewMode}
          onEditClick={(item) => {
            // Convert the item to GroupedInventoryItem if needed
            const groupedItem = groupedItems.find((g) =>
              g.ids.includes(item.id)
            );
            if (groupedItem) {
              openEditModal(groupedItem);
            }
          }}
          onDeleteClick={(item) => {
            // Convert the item to GroupedInventoryItem if needed
            const groupedItem = groupedItems.find((g) =>
              g.ids.includes(item.id)
            );
            if (groupedItem) {
              openDeleteModal(groupedItem);
            }
          }}
          onUpdateQuantity={handleQuickQuantityUpdate}
          selectedItems={selectedItems}
          toggleItemSelection={toggleItemSelection}
          toggleAllItems={toggleAllItems}
          formatCurrency={formatCurrency}
          openAddModal={openAddModal}
        />
      </div>

      {/* Modals */}
      <InventoryModals
        isModalOpen={isAddModalOpen || isEditModalOpen}
        selectedItem={currentItem || undefined}
        isDeleteDialogOpen={isDeleteModalOpen}
        itemToDelete={currentItem}
        onCloseModal={isAddModalOpen ? closeAddModal : closeEditModal}
        onCloseDeleteDialog={closeDeleteModal}
        onSaveItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        customCategories={categories}
        suppliers={suppliers as Supplier[]}
        userRole={userRole as "admin" | "manager" | "staff"}
      />

      {/* Batch Operations */}
      <BatchOperations
        selectedIds={selectedItems}
        actions={batchActions}
        onClearSelection={clearSelection}
        selectionLabel="Item"
      />
    </div>
  );
}
