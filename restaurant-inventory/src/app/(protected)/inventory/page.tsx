"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InventoryDataTable } from "./components/table/InventoryDataTable";
import { InventoryCards } from "./components/InventoryCards";
import InventoryFilters from "./components/InventoryFilters";
import InventoryHeader from "./components/InventoryHeader";
import { InventoryStats } from "./components/InventoryStats";
import InventoryLoading from "./components/InventoryLoading";
import { InventoryModals } from "./components/modals";
import { InventoryItem, Supplier } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useInventory } from "./hooks/useInventory";
import { motion } from "framer-motion";
import { usePermission } from "@/lib/permission-context";
import { useCurrency } from "@/lib/currency";
import { supplierService } from "@/lib/services/supplier-service";

// Interface for form data that includes both snake_case and camelCase properties
interface InventoryFormData
  extends Omit<InventoryItem, "id" | "created_at" | "updated_at"> {
  reorderLevel?: number;
  expiryDate?: string;
}

// New interface for grouped inventory items
interface GroupedInventoryItem extends Omit<InventoryItem, "id" | "quantity"> {
  ids: string[]; // All item IDs in this group
  totalQuantity: number; // Combined quantity
  latestUpdate: string; // Date of most recent update
  batchCount: number; // Number of distinct batches/entries
  // We keep the original items for reference when needed
  originalItems: InventoryItem[];
}

export default function Inventory() {
  const { toast } = useToast();
  const { userRole } = usePermission();
  const { formatCurrency } = useCurrency();
  const {
    items,
    categories,
    isLoading,
    addItem: addInventoryItem,
    updateItem: updateInventoryItem,
    deleteItem: deleteInventoryItem,
  } = useInventory();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<
    string | undefined
  >(undefined);
  const [categoriesError, setCategoriesError] = useState<string | undefined>(
    undefined
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Use grouped items for filtering
  const [filteredGroupedItems, setFilteredGroupedItems] = useState<
    GroupedInventoryItem[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for InventoryDataTable
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [compactMode] = useState(false);

  // Group similar inventory items
  const groupedItems = useMemo(() => {
    // Create a map to group items by a combination of name and category
    const groupMap = new Map<string, GroupedInventoryItem>();

    items.forEach((item) => {
      // Create a unique key for grouping (adjust this based on what makes items "the same")
      const groupKey = `${item.name.toLowerCase()}_${item.category.toLowerCase()}`;

      if (!groupMap.has(groupKey)) {
        // Create a new group with this item as the first entry
        groupMap.set(groupKey, {
          ...item,
          ids: [item.id],
          totalQuantity: item.quantity,
          latestUpdate: item.updated_at,
          batchCount: 1,
          originalItems: [item],
        });
      } else {
        // Add this item to an existing group
        const group = groupMap.get(groupKey)!;
        group.ids.push(item.id);
        group.totalQuantity += item.quantity;
        group.batchCount += 1;

        // Keep track of the most recent update
        if (new Date(item.updated_at) > new Date(group.latestUpdate)) {
          group.latestUpdate = item.updated_at;
        }

        group.originalItems.push(item);
      }
    });

    // Convert the map back to an array for display
    return Array.from(groupMap.values());
  }, [items]);

  // Filter grouped items based on search query, selected category, and low stock filter
  useEffect(() => {
    let result = [...groupedItems];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by low stock
    if (showLowStockOnly) {
      result = result.filter((item) => {
        const reorderLevel =
          item.reorder_point || item.minimum_stock_level || 5;
        const isItemLowStock =
          item.totalQuantity <= reorderLevel && item.totalQuantity > 0;
        const isItemOutOfStock = item.totalQuantity === 0;
        return isItemLowStock || isItemOutOfStock;
      });
    }

    setFilteredGroupedItems(result);
  }, [groupedItems, searchQuery, selectedCategory, showLowStockOnly]);

  // Helper function to check if a grouped item is low on stock
  const isGroupLowStock = (item: GroupedInventoryItem): boolean => {
    const reorderLevel = item.reorder_point || item.minimum_stock_level || 5;
    return item.totalQuantity <= reorderLevel && item.totalQuantity > 0;
  };

  // Helper function to check if a grouped item is out of stock
  const isGroupOutOfStock = (item: GroupedInventoryItem): boolean => {
    return item.totalQuantity === 0;
  };

  // Calculate inventory statistics
  const lowStockCount = groupedItems.filter((item) =>
    isGroupLowStock(item)
  ).length;
  const outOfStockCount = groupedItems.filter((item) =>
    isGroupOutOfStock(item)
  ).length;
  const totalValue = groupedItems.reduce(
    (sum, item) => sum + item.cost_per_unit * item.totalQuantity,
    0
  );

  // Helper functions for InventoryDataTable
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllItems = () => {
    if (selectedItems.length === filteredGroupedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredGroupedItems.map((item) => item.ids[0]));
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoadingSuppliers(true);
        const supplierData = await supplierService.getSuppliers();
        setSuppliers(supplierData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Mock subscription setup - in a real app, this would connect to your real-time service
  useEffect(() => {
    // Simulate subscription to real-time updates
    const setupSubscription = () => {
      try {
        // This would be your actual subscription logic
        setIsSubscribed(true);
        setSubscriptionError(undefined);
      } catch (err) {
        setSubscriptionError("Failed to connect to real-time updates");
        setIsSubscribed(false);
        console.error("Subscription error:", err);
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      // Cleanup subscription
    };
  }, []);

  // Modal handlers
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (groupedItem: GroupedInventoryItem) => {
    // Use the most recently updated item in the group for editing
    const mostRecentItem = groupedItem.originalItems.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];

    setCurrentItem(mostRecentItem);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const openDeleteModal = (groupedItem: GroupedInventoryItem) => {
    // For deletion, we'll need to handle deletion of all related items or select a specific one
    // For now, just use the first item in the group
    setCurrentItem(groupedItem.originalItems[0]);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // Retry functions
  const retryCategories = () => {
    setCategoriesError(undefined);
    // Logic to retry fetching categories
  };

  const retrySubscription = () => {
    setSubscriptionError(undefined);
    // Logic to retry setting up subscription
  };

  // Handle form submissions
  const handleAddItem = async (itemData: InventoryFormData) => {
    try {
      // Convert form data to the format expected by the API
      const apiData = {
        ...itemData,
        // Add timestamps that will be overwritten by the service anyway
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">;

      await addInventoryItem(apiData);
      toast({
        title: "Item Added",
        description: `${itemData.name} has been added to inventory.`,
      });
      closeAddModal();
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (itemData: InventoryFormData) => {
    if (!currentItem) return;
    try {
      // Convert form data to the format expected by the API
      const apiData = {
        ...itemData,
        // Add any missing properties that might be required
        updated_at: new Date().toISOString(),
      } as unknown as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">;

      await updateInventoryItem(currentItem.id, apiData);
      toast({
        title: "Item Updated",
        description: `${itemData.name} has been updated.`,
      });
      closeEditModal();
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!currentItem) return;
    try {
      await deleteInventoryItem(currentItem.id);
      toast({
        title: "Item Deleted",
        description: `${currentItem.name} has been removed from inventory.`,
      });
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickQuantityUpdate = async (
    itemId: string,
    newQuantity: number
  ) => {
    const itemToUpdate = items.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    try {
      // For simple quantity updates, we only need to pass the quantity
      await updateInventoryItem(itemId, {
        quantity: newQuantity,
      } as unknown as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">);

      toast({
        title: "Quantity Updated",
        description: `${itemToUpdate.name} quantity updated to ${newQuantity} ${itemToUpdate.unit}.`,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

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
        totalItems={groupedItems.length}
        lowStockItems={lowStockCount}
        outOfStockItems={outOfStockCount}
        totalValue={totalValue}
      />

      {/* Filters */}
      <InventoryFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        showLowStock={showLowStockOnly}
        onLowStockChange={setShowLowStockOnly}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={openAddModal}
      />

      {/* Inventory Content */}
      <div className="rounded-lg">
        {filteredGroupedItems.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="text-center py-16 bg-white dark:bg-gray-950 rounded-lg border shadow-xs">
              <div className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {searchQuery || selectedCategory !== "all" || showLowStockOnly
                  ? "No items match your current filters. Try adjusting your search criteria."
                  : "Your inventory is empty. Add your first item to get started."}
              </p>
              {!searchQuery &&
                selectedCategory === "all" &&
                !showLowStockOnly && (
                  <Button onClick={openAddModal} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Your First Item
                  </Button>
                )}
            </div>
          </motion.div>
        ) : (
          <div className="mb-6">
            {viewMode === "table" ? (
              <div>
                <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-4 text-sm text-amber-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
                    />
                  </svg>
                  <span>
                    Showing {filteredGroupedItems.length} unique products (from{" "}
                    {items.length} total entries). Similar items have been
                    grouped together.
                  </span>
                </div>
                <InventoryDataTable
                  items={
                    filteredGroupedItems.map((group) => ({
                      ...group,
                      id: group.ids[0], // Using first ID for compatibility
                      quantity: group.totalQuantity,
                      updated_at: group.latestUpdate,
                      // Add any additional properties used by the table component
                    })) as InventoryItem[]
                  }
                  compactMode={compactMode}
                  selectedItems={selectedItems}
                  expandedItems={expandedItems}
                  onEditClick={(item) =>
                    openEditModal(item as unknown as GroupedInventoryItem)
                  }
                  onDeleteClick={(item) =>
                    openDeleteModal(item as unknown as GroupedInventoryItem)
                  }
                  onUpdateQuantity={handleQuickQuantityUpdate}
                  toggleItemSelection={toggleItemSelection}
                  toggleAllItems={toggleAllItems}
                  toggleExpanded={toggleExpanded}
                  formatCurrency={formatCurrency}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                />
              </div>
            ) : (
              <InventoryCards
                items={
                  filteredGroupedItems.map((group) => ({
                    ...group,
                    id: group.ids[0], // Using first ID for compatibility
                    quantity: group.totalQuantity,
                    updated_at: group.latestUpdate,
                  })) as InventoryItem[]
                }
                onEditClick={(item) =>
                  openEditModal(item as unknown as GroupedInventoryItem)
                }
                onDeleteClick={(item) =>
                  openDeleteModal(item as unknown as GroupedInventoryItem)
                }
              />
            )}
          </div>
        )}
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
    </div>
  );
}
