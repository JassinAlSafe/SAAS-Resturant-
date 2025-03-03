import { useState, useEffect } from "react";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/services/inventory-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import { useApiRequest } from "@/lib/hooks/useApiRequest";
import { useInventorySubscription } from "@/lib/hooks/useInventorySubscription";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { success, error: showError } = useNotificationHelpers();

  // Use enhanced API request hook for inventory items
  const {
    isLoading: isLoadingItems,
    error: itemsError,
    execute: fetchItems,
    retry: retryFetchItems,
  } = useApiRequest<InventoryItem[]>(inventoryService.getItems, {
    onSuccess: (data) => {
      setItems(data);
    },
    onError: (err) => {
      console.error("Error fetching inventory items:", err);
      showError(
        "Failed to load inventory",
        "There was an error loading your inventory data."
      );
    },
  });

  // Use enhanced API request hook for categories
  const {
    isLoading: isLoadingCategories,
    error: categoriesError,
    execute: fetchCategories,
    retry: retryFetchCategories,
  } = useApiRequest<string[]>(inventoryService.getCategories, {
    onSuccess: (data) => {
      setCategories(data);
    },
    onError: (err) => {
      console.error("Error fetching categories:", err);
    },
  });

  // Use inventory subscription hook for real-time updates
  const {
    isSubscriptionLoading,
    subscriptionError,
    isSubscribed,
    retrySubscription,
  } = useInventorySubscription({
    onItemsChanged: (updatedItems) => {
      setItems(updatedItems);

      // Update categories if needed
      const uniqueCategories = [
        ...new Set(updatedItems.map((item) => item.category)),
      ];
      if (
        uniqueCategories.length !== categories.length ||
        !uniqueCategories.every((cat) => categories.includes(cat))
      ) {
        fetchCategories();
      }
    },
  });

  // Combined loading state
  const isLoading = isLoadingItems || isLoadingCategories;

  // Fetch inventory and categories
  const fetchInventory = async () => {
    await Promise.all([fetchItems(), fetchCategories()]);
  };

  // Handle adding a new inventory item
  const addItem = async (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newItem = await inventoryService.addItem(itemData);
      if (newItem) {
        setItems([...items, newItem]);
        success(
          "Item Added",
          `${newItem.name} has been added to your inventory.`
        );

        // Add new category if it doesn't exist
        if (!categories.includes(newItem.category)) {
          setCategories([...categories, newItem.category]);
        }

        return newItem;
      }
    } catch (err) {
      console.error("Error adding inventory item:", err);
      showError("Failed to add item", "Please try again.");
      throw err;
    }
  };

  // Handle updating an inventory item
  const updateItem = async (
    itemId: string,
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const updatedItem = await inventoryService.updateItem(itemId, itemData);

      if (updatedItem) {
        setItems(
          items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        success("Item Updated", `${updatedItem.name} has been updated.`);

        // Add new category if it doesn't exist
        if (!categories.includes(updatedItem.category)) {
          setCategories([...categories, updatedItem.category]);
        }

        return updatedItem;
      }
    } catch (err) {
      console.error("Error updating inventory item:", err);
      showError("Failed to update item", "Please try again.");
      throw err;
    }
  };

  // Handle deleting an inventory item
  const deleteItem = async (itemId: string) => {
    try {
      const deleteSuccess = await inventoryService.deleteItem(itemId);

      if (deleteSuccess) {
        const deletedItem = items.find((item) => item.id === itemId);
        setItems(items.filter((item) => item.id !== itemId));

        if (deletedItem) {
          success(
            "Item Deleted",
            `${deletedItem.name} has been removed from your inventory.`
          );
        }

        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      showError("Failed to delete item", "Please try again.");
      throw err;
    }
  };

  // Load items on hook initialization
  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    items,
    categories,
    isLoading,
    itemsError,
    categoriesError,
    subscriptionError,
    isSubscribed,
    fetchInventory,
    retryFetchItems,
    retryFetchCategories,
    retrySubscription,
    addItem,
    updateItem,
    deleteItem,
  };
}
