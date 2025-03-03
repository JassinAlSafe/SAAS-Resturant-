"use client";

import { useState } from "react";
import { Supplier } from "@/lib/types";

export function useSupplierModals() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<
    Supplier | undefined
  >(undefined);

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );

  // Open modal for adding a new supplier
  const openAddModal = () => {
    setSelectedSupplier(undefined);
    setIsModalOpen(true);
  };

  // Open modal for editing a supplier
  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  // Close supplier modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(undefined);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  return {
    // Modal state
    isModalOpen,
    selectedSupplier,

    // Delete dialog state
    isDeleteDialogOpen,
    supplierToDelete,

    // Modal actions
    openAddModal,
    openEditModal,
    openDeleteDialog,
    closeModal,
    closeDeleteDialog,
  };
}
