"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { supabase } from "@/lib/supabase/browser-client";
import { toast } from "sonner";

export function useShoppingList() {
  const queryClient = useQueryClient();

  // Fetch shopping list items
  const {
    data: shoppingList = [],
    isLoading: isLoadingList,
    error: listError,
    refetch: refetchShoppingList,
  } = useQuery({
    queryKey: ["shopping-list"],
    queryFn: fetchShoppingList,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["shopping-categories"],
    queryFn: fetchCategories,
    retry: 1,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
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
      // Optimistically update the cache
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) => [newItem, ...old]
      );
      toast.success("Item added to shopping list");
    },
    onError: (err: Error) => {
      toast.error(`Failed to add item: ${err.message}`);
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
      // Optimistically update the cache
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) =>
          old.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      toast.success("Item updated successfully");
    },
    onError: (err: Error) => {
      toast.error(`Failed to update item: ${err.message}`);
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => deleteShoppingItem(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["shopping-list"] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<ShoppingListItem[]>([
        "shopping-list",
      ]);

      // Optimistically remove the item from the list
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) => old.filter((item) => item.id !== id)
      );

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("Item removed from shopping list");
    },
    onError: (err: Error, _, context) => {
      // Restore the previous state if there was an error
      if (context?.previousItems) {
        queryClient.setQueryData(["shopping-list"], context.previousItems);
      }
      toast.error(`Failed to delete item: ${err.message}`);
    },
  });

  // Mark as purchased mutation
  const markAsPurchasedMutation = useMutation({
    mutationFn: ({ id, isPurchased }: { id: string; isPurchased: boolean }) =>
      markItemAsPurchased(id, isPurchased),
    onMutate: async ({ id, isPurchased }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["shopping-list"] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<ShoppingListItem[]>([
        "shopping-list",
      ]);

      // Optimistically update the purchase status
      queryClient.setQueryData<ShoppingListItem[]>(
        ["shopping-list"],
        (old = []) =>
          old.map((item) =>
            item.id === id
              ? {
                  ...item,
                  isPurchased,
                  purchasedAt: isPurchased
                    ? new Date().toISOString()
                    : undefined,
                }
              : item
          )
      );

      return { previousItems };
    },
    onSuccess: (updatedItem) => {
      const statusText = updatedItem.isPurchased
        ? "marked as purchased"
        : "marked as not purchased";
      toast.success(`Item ${statusText}`);
    },
    onError: (err: Error, _, context) => {
      // Restore the previous state if there was an error
      if (context?.previousItems) {
        queryClient.setQueryData(["shopping-list"], context.previousItems);
      }
      toast.error(`Failed to update purchase status: ${err.message}`);
    },
  });

  // Generate list mutation
  const generateListMutation = useMutation({
    mutationFn: generateShoppingList,
    onSuccess: (newItems) => {
      // Refresh the shopping list after generating new items
      queryClient.invalidateQueries({
        queryKey: ["shopping-list"],
      });
      toast.success(
        `Generated ${newItems.length} shopping items based on inventory`
      );
    },
    onError: (err: Error) => {
      toast.error(`Failed to generate shopping list: ${err.message}`);
    },
  });

  return {
    shoppingList,
    categories,
    isLoading: isLoadingList || isLoadingCategories,
    error: listError || categoriesError,
    refetch: refetchShoppingList,
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
