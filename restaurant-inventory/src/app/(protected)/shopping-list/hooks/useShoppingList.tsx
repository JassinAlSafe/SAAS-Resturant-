"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationHelpers } from "@/lib/notification-context";
import { useBusinessProfile } from "@/lib/hooks/useBusinessProfile";
import {
  fetchShoppingList,
  fetchCategories,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  markItemAsPurchased,
  generateShoppingList,
} from "@/lib/api/shopping-list";
import { ShoppingListItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function useShoppingList() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationHelpers();
  const { businessProfile, isLoading: isLoadingProfile } = useBusinessProfile();

  // Fetch shopping list items
  const {
    data: shoppingList = [],
    isLoading: isLoadingList,
    error: listError,
  } = useQuery({
    queryKey: ["shopping-list", businessProfile?.id],
    queryFn: () => fetchShoppingList(businessProfile?.id as string),
    enabled: !!businessProfile?.id,
    retry: 1, // Only retry once to avoid excessive failed requests
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories", businessProfile?.id],
    queryFn: () => fetchCategories(businessProfile?.id as string),
    enabled: !!businessProfile?.id,
    retry: 1, // Only retry once to avoid excessive failed requests
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (
      item: Omit<
        ShoppingListItem,
        "id" | "added_at" | "purchased_at" | "business_profile_id" | "user_id"
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
          user_id: user.id,
          ...(businessProfile?.id
            ? { business_profile_id: businessProfile.id }
            : {}),
        };

        return createShoppingItem(
          itemData as Omit<
            ShoppingListItem,
            "id" | "added_at" | "purchased_at"
          >,
          businessProfile?.id as string
        );
      } catch (error) {
        console.error("Error in addItemMutation:", error);
        throw error;
      }
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list", businessProfile?.id],
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
    }) => updateShoppingItem(id, updates, businessProfile?.id as string),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list", businessProfile?.id],
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
    mutationFn: (id: string) =>
      deleteShoppingItem(id, businessProfile?.id as string),
    onSuccess: (_, id) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list", businessProfile?.id],
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
      markItemAsPurchased(id, isPurchased, businessProfile?.id as string),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list", businessProfile?.id],
        (old = []) =>
          old.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      success(
        updatedItem.is_purchased ? "Item Purchased" : "Item Unpurchased",
        "Item status has been updated."
      );
    },
    onError: (err: Error) => {
      showError("Failed to update item status", err.message);
    },
  });

  // Generate list mutation
  const generateListMutation = useMutation({
    mutationFn: () => generateShoppingList(businessProfile?.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", businessProfile?.id],
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
    isLoading: isLoadingProfile || isLoadingList || isLoadingCategories,
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
