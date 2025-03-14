"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Supplier } from "@/lib/types";
import { useNotificationHelpers } from "@/lib/notification-context";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  bulkDeleteSuppliers,
} from "@/lib/api/suppliers";

export function useSuppliers() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotificationHelpers();

  // Query for fetching suppliers
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  // Mutation for adding a supplier
  const addSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: (newSupplier) => {
      queryClient.setQueryData<Supplier[]>(["suppliers"], (old = []) => [
        ...old,
        newSupplier,
      ]);
      success(
        "Supplier Added",
        `${newSupplier.name} has been added to your suppliers list.`
      );
    },
    onError: (err: Error) => {
      console.error("Error adding supplier:", err);
      showError("Failed to add supplier", err.message);
    },
  });

  // Mutation for updating a supplier
  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      updateSupplier(id, data),
    onSuccess: (updatedSupplier) => {
      queryClient.setQueryData<Supplier[]>(["suppliers"], (old = []) =>
        old.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
      );
      success(
        "Supplier Updated",
        `${updatedSupplier.name} has been updated successfully.`
      );
    },
    onError: (err: Error) => {
      console.error("Error updating supplier:", err);
      showError("Failed to update supplier", err.message);
    },
  });

  // Mutation for deleting a supplier
  const deleteSupplierMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Supplier[]>(["suppliers"], (old = []) =>
        old.filter((s) => s.id !== id)
      );
      success(
        "Supplier Deleted",
        "The supplier has been removed successfully."
      );
    },
    onError: (err: Error) => {
      console.error("Error deleting supplier:", err);
      showError("Failed to delete supplier", err.message);
    },
  });

  // Mutation for bulk deleting suppliers
  const bulkDeleteSuppliersMutation = useMutation({
    mutationFn: bulkDeleteSuppliers,
    onSuccess: (_, ids) => {
      queryClient.setQueryData<Supplier[]>(["suppliers"], (old = []) =>
        old.filter((s) => !ids.includes(s.id))
      );
      success(
        "Suppliers Deleted",
        `${ids.length} suppliers have been removed successfully.`
      );
    },
    onError: (err: Error) => {
      console.error("Error bulk deleting suppliers:", err);
      showError("Failed to delete suppliers", err.message);
    },
  });

  return {
    suppliers,
    isLoading,
    error,
    addSupplier: addSupplierMutation.mutateAsync,
    updateSupplier: (id: string, data: Partial<Supplier>) =>
      updateSupplierMutation.mutateAsync({ id, data }),
    deleteSupplier: deleteSupplierMutation.mutateAsync,
    bulkDeleteSuppliers: bulkDeleteSuppliersMutation.mutateAsync,
    isAddingSupplier: addSupplierMutation.isPending,
    isUpdatingSupplier: updateSupplierMutation.isPending,
    isDeletingSupplier: deleteSupplierMutation.isPending,
    isBulkDeletingSuppliers: bulkDeleteSuppliersMutation.isPending,
  };
}
