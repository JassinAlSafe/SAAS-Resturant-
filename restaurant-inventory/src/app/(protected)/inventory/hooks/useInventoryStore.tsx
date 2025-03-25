import { useCallback, useEffect, useState } from "react";
import { useInventoryStore } from "@/lib/stores/inventory-store";
import { InventoryItem, InventoryFormData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useInventorySubscription } from "@/lib/hooks/useInventorySubscription";
import { inventoryService } from "@/lib/services/inventory-service";
import { v4 as uuidv4 } from "uuid";

export const useInventoryManager = () => {
  const toast = useToast();

  // State for real-time updates
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false);

  // Extract state and actions from the store using selector functions
  // to prevent unnecessary re-renders
  const items = useInventoryStore((state) => state.items);
  const categories = useInventoryStore((state) => state.categories);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const isSubmitting = useInventoryStore((state) => state.isSubmitting);
  const error = useInventoryStore((state) => state.error);
  const selectedItem = useInventoryStore((state) => state.selectedItem);
  const lastUpdated = useInventoryStore((state) => state.lastUpdated);

  // Extract filter state
  const categoryFilter = useInventoryStore((state) => state.categoryFilter);
  const searchQuery = useInventoryStore((state) => state.searchQuery);
  const sortField = useInventoryStore((state) => state.sortField);
  const sortDirection = useInventoryStore((state) => state.sortDirection);

  // Extract actions
  const fetchInventory = useInventoryStore((state) => state.fetchInventory);
  const updateItem = useInventoryStore((state) => state.updateItem);
  const deleteItem = useInventoryStore((state) => state.deleteItem);
  const setSelectedItem = useInventoryStore((state) => state.setSelectedItem);

  // Extract filter actions
  const setCategoryFilter = useInventoryStore(
    (state) => state.setCategoryFilter
  );
  const setSearchQuery = useInventoryStore((state) => state.setSearchQuery);
  const setSortField = useInventoryStore((state) => state.setSortField);
  const setSortDirection = useInventoryStore((state) => state.setSortDirection);
  const resetFilters = useInventoryStore((state) => state.resetFilters);

  // Extract computed values
  const getFilteredItems = useInventoryStore((state) => state.getFilteredItems);
  const getItemsByCategory = useInventoryStore(
    (state) => state.getItemsByCategory
  );
  const getLowStockItems = useInventoryStore((state) => state.getLowStockItems);

  // Callback to handle real-time inventory updates
  const handleItemsChanged = useCallback(
    (updatedItems: InventoryItem[]) => {
      if (updatedItems && updatedItems.length > 0) {
        console.log("Received updated inventory items:", updatedItems);
        // Update the store with new items - ensure we're using the proper setter function
        fetchInventory();
      }
    },
    [fetchInventory]
  );

  // Use the subscription hook for real-time updates
  const { isSubscriptionLoading, subscriptionError, isSubscribed } =
    useInventorySubscription({
      onItemsChanged: handleItemsChanged,
    });

  // Enhance addItem with toast notification
  const handleAddItem = async (itemData: InventoryFormData) => {
    const tempId = uuidv4();

    try {
      // Add optimistic update
      const optimisticItem = {
        id: tempId,
        ...itemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      useInventoryStore.setState((state) => ({
        items: [...state.items, optimisticItem],
      }));

      // Make API call
      const response = await inventoryService.addItem({
        ...itemData,
        reorder_level: itemData.reorder_level ?? 0,
      });

      if (!response) {
        throw new Error("Failed to add item");
      }

      // Update with actual data from server
      useInventoryStore.setState((state) => ({
        items: state.items.map((item) =>
          item.id === tempId ? response : item
        ),
      }));

      toast.toast({
        title: "Item Added",
        description: `${response.name} has been added to your inventory.`,
        variant: "default",
      });

      return response;
    } catch (error) {
      console.error("Error adding item:", error);

      // Remove optimistic update on error
      useInventoryStore.setState((state) => ({
        items: state.items.filter((item) => item.id !== tempId),
      }));

      toast.toast({
        title: "Error",
        description: "Failed to add inventory item.",
        variant: "destructive",
      });

      throw error;
    }
  };

  // Enhance updateItem with toast notification
  const handleUpdateItem = useCallback(
    async (id: string, updates: Partial<InventoryFormData>) => {
      try {
        const result = await updateItem(id, updates);

        if (!result) {
          throw new Error("Failed to update item");
        }

        toast.toast({
          title: "Item Updated",
          description: `${result.name} has been updated.`,
          variant: "default",
        });

        return result;
      } catch (error: unknown) {
        console.error("Error updating item:", error);
        toast.toast({
          title: "Error",
          description: "Failed to update inventory item.",
          variant: "destructive",
        });
        return null;
      }
    },
    [updateItem, toast]
  );

  // Enhance deleteItem with toast notification
  const handleDeleteItem = useCallback(
    async (id: string, itemName: string) => {
      try {
        const result = await deleteItem(id);

        if (!result) {
          throw new Error("Failed to delete item");
        }

        toast.toast({
          title: "Item Deleted",
          description: `${itemName} has been removed from your inventory.`,
          variant: "default",
        });

        return result;
      } catch (error: unknown) {
        console.error("Error deleting item:", error);
        toast.toast({
          title: "Error",
          description: "Failed to delete inventory item.",
          variant: "destructive",
        });
        return false;
      }
    },
    [deleteItem, toast]
  );

  // Toggle real-time updates
  const toggleRealtime = useCallback(() => {
    setIsRealtimeEnabled((prev) => !prev);
  }, []);

  // Fetch inventory on mount
  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window !== "undefined") {
      fetchInventory();
      setIsRealtimeEnabled(true);
    }
  }, [fetchInventory]);

  // Return a simplified API for components
  return {
    // State
    items,
    categories,
    isLoading: isLoading || isSubscriptionLoading,
    isSubmitting,
    error: error || subscriptionError,
    selectedItem,
    lastUpdated,
    isRealtimeEnabled,
    isSubscribed,

    // Filter state
    categoryFilter,
    searchQuery,
    sortField,
    sortDirection,

    // Actions
    fetchInventory,
    addItem: handleAddItem,
    updateItem: handleUpdateItem,
    deleteItem: handleDeleteItem,
    setSelectedItem,
    toggleRealtime,

    // Filter actions
    setCategoryFilter,
    setSearchQuery,
    setSortField,
    setSortDirection,
    resetFilters,

    // Computed values
    filteredItems: getFilteredItems(),
    itemsByCategory: getItemsByCategory(),
    lowStockItems: getLowStockItems(),

    // Stats - Let components calculate these client-side to avoid hydration issues
    totalItems: items.length,
    totalCategories: categories.length,
    lowStockCount: getLowStockItems().length,
  };
};
