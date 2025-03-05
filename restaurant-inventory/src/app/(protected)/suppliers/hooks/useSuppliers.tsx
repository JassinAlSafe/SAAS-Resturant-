"use client";

import { useState, useEffect } from "react";
import { Supplier } from "@/lib/types";
import { supplierService } from "@/lib/services/supplier-service";
import { useNotificationHelpers } from "@/lib/notification-context";

export function useSuppliers() {
  // State for suppliers data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notifications
  const { success, error: showError } = useNotificationHelpers();

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSuppliers = await supplierService.getSuppliers();
      setSuppliers(fetchedSuppliers);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to load suppliers data. Please try again later.");
      showError(
        "Failed to load suppliers",
        "There was an error loading your supplier data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new supplier
  const addSupplier = async (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newSupplier = await supplierService.addSupplier(supplierData);
      if (newSupplier) {
        setSuppliers((prev) => [...prev, newSupplier]);
        success(
          "Supplier Added",
          `${newSupplier.name} has been added to your suppliers list.`
        );
        return newSupplier;
      }
      return null;
    } catch (err) {
      console.error("Error adding supplier:", err);
      showError(
        "Failed to add supplier",
        "There was an error adding this supplier."
      );
      return null;
    }
  };

  // Handle updating an existing supplier
  const updateSupplier = async (
    id: string,
    supplierData: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const updatedSupplier = await supplierService.updateSupplier(
        id,
        supplierData
      );
      if (updatedSupplier) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === id ? updatedSupplier : s))
        );
        success(
          "Supplier Updated",
          `${updatedSupplier.name} has been updated.`
        );
        return updatedSupplier;
      }
      return null;
    } catch (err) {
      console.error("Error updating supplier:", err);
      showError(
        "Failed to update supplier",
        "There was an error updating this supplier."
      );
      return null;
    }
  };

  // Handle deleting a supplier
  const deleteSupplier = async (id: string) => {
    try {
      const isDeleted = await supplierService.deleteSupplier(id);
      if (isDeleted) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
        success(
          "Supplier Deleted",
          "The supplier has been removed from your list."
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting supplier:", err);
      showError(
        "Failed to delete supplier",
        "There was an error deleting this supplier."
      );
      return false;
    }
  };

  // Handle bulk deleting suppliers
  const bulkDeleteSuppliers = async (ids: string[]) => {
    try {
      const isDeleted = await supplierService.bulkDeleteSuppliers(ids);
      if (isDeleted) {
        setSuppliers((prev) => prev.filter((s) => !ids.includes(s.id)));
        success(
          "Suppliers Deleted",
          `${ids.length} suppliers have been removed from your list.`
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error bulk deleting suppliers:", err);
      showError(
        "Failed to delete suppliers",
        "There was an error deleting the selected suppliers."
      );
      return false;
    }
  };

  // Load suppliers on hook initialization
  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    isLoading,
    error,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    bulkDeleteSuppliers,
  };
}
