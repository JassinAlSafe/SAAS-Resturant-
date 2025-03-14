"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationHelpers } from "@/lib/notification-context";
import {
  fetchShoppingList,
  fetchCategories,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  markItemAsPurchased,
  generateShoppingList,
} from "@/app/(protected)/shopping-list/api/shopping-list";
import { ShoppingListItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function useShoppingList() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationHelpers();

  // Fetch shopping list items
  const {
    data: shoppingList = [],
    isLoading: isLoadingList,
    error: listError,
  } = useQuery({
    queryKey: ["shopping-list"],
    queryFn: () => fetchShoppingList(),
    retry: 1, // Only retry once to avoid excessive failed requests
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    retry: 1, // Only retry once to avoid excessive failed requests
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (
      item: Omit<
        ShoppingListItem,
        "id" | "addedAt" | "purchasedAt" | "businessProfileId" | "userId"
      >
    ) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Create the item data with proper typing
        const itemData = {
          ...item,
          userId: user.id,
        };

        return createShoppingItem(
          itemData as Omit<ShoppingListItem, "id" | "addedAt" | "purchasedAt">
        );
      } catch (error) {
        console.error("Error in addItemMutation:", error);
        throw error;
      }
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) => [newItem, ...old]
      );
      success("Item Added", "Item has been added to your shopping list.");
    },
    onError: (err: Error) => {
      showError("Failed to add item", err.message);
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ShoppingListItem>;
    }) => updateShoppingItem(id, updates),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) =>
          old.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      success("Item Updated", "Item has been updated successfully.");
    },
    onError: (err: Error) => {
      showError("Failed to update item", err.message);
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => deleteShoppingItem(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) => old.filter((item) => item.id !== id)
      );
      success("Item Deleted", "Item has been removed from your list.");
    },
    onError: (err: Error) => {
      showError("Failed to delete item", err.message);
    },
  });

  // Mark as purchased mutation
  const markAsPurchasedMutation = useMutation({
    mutationFn: ({ id, isPurchased }: { id: string; isPurchased: boolean }) =>
      markItemAsPurchased(id, isPurchased),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) =>
          old.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      success(
        updatedItem.isPurchased ? "Item Purchased" : "Item Unpurchased",
        "Item status has been updated."
      );
    },
    onError: (err: Error) => {
      showError("Failed to update item status", err.message);
    },
  });

  // Generate list mutation
  const generateListMutation = useMutation({
    mutationFn: () => generateShoppingList(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shopping-list"],
      });
      success(
        "List Generated",
        "Shopping list has been generated from inventory."
      );
    },
    onError: (err: Error) => {
      showError("Failed to generate list", err.message);
    },
  });

  return {
    shoppingList,
    categories,
    isLoading: isLoadingList || isLoadingCategories,
    error: listError || categoriesError,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    removeItem: deleteItemMutation.mutateAsync,
    markAsPurchased: markAsPurchasedMutation.mutateAsync,
    generateList: generateListMutation.mutateAsync,
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isDeletingItem: deleteItemMutation.isPending,
    isMarkingAsPurchased: markAsPurchasedMutation.isPending,
    isGeneratingList: generateListMutation.isPending,
  };
}
