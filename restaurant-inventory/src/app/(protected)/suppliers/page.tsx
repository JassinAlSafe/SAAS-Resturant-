"use client";

import { useState } from "react";
import { ApiError } from "@/components/ui/api-error";
import { useSuppliers } from "./hooks/useSuppliers";
import { useSupplierModals } from "./hooks/useSupplierModals";
import { useSupplierExport } from "./hooks/useSupplierExport";
import SupplierTable from "./components/SupplierTable";
import SupplierHeader from "./components/SupplierHeader";
import SupplierLoading from "./components/SupplierLoading";
import EmptySuppliers from "./components/EmptySuppliers";
import { SupplierModals } from "./components/modals";
import { toast } from "sonner";
import { Supplier, SupplierCategory } from "@/lib/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Suppliers() {
  // Use our custom hooks
  const {
    suppliers,
    isLoading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    bulkDeleteSuppliers,
  } = useSuppliers();

  const {
    isModalOpen,
    selectedSupplier,
    isDeleteDialogOpen,
    supplierToDelete,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    closeModal,
    closeDeleteDialog,
  } = useSupplierModals();

  // Local search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SupplierCategory | null>(null);

  const { handleExportSuppliers } = useSupplierExport(suppliers);

  // Handle saving a supplier (either add or update)
  const handleSaveSupplier = async (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, supplierData);
        toast.success("Supplier updated successfully");
      } else {
        await addSupplier(supplierData);
        toast.success("Supplier created successfully");
      }
      closeModal();
    } catch (error) {
      toast.error("Failed to save supplier");
      console.error(error);
    }
  };

  // Handle deleting a supplier
  const handleDeleteSupplier = async () => {
    try {
      if (supplierToDelete) {
        await deleteSupplier(supplierToDelete.id);
        toast.success("Supplier deleted successfully");
        closeDeleteDialog();
      }
    } catch (error) {
      toast.error("Failed to delete supplier");
      console.error(error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, suppliers: Supplier[]) => {
    if (action === "delete") {
      try {
        await bulkDeleteSuppliers(suppliers.map((s) => s.id));
        toast.success(`${suppliers.length} suppliers deleted successfully`);
      } catch (error) {
        toast.error("Failed to delete suppliers");
        console.error(error);
      }
    } else if (action === "export") {
      handleExportSuppliers(suppliers);
    }
  };

  // Handle category filter changes
  const handleCategoryFilterChange = (category: SupplierCategory | null) => {
    setSelectedCategory(category);
  };

  // Show loading state
  if (isLoading) {
    return <SupplierLoading />;
  }

  // Show error state
  if (error) {
    return <ApiError error={error} />;
  }

  // Filter suppliers based on search term and selected category
  const filteredSuppliers = suppliers.filter((supplier) => {
    // Filter by search term
    const matchesSearch =
      !searchTerm ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contactName &&
        supplier.contactName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (supplier.email &&
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.phone &&
        supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by category
    const matchesCategory =
      !selectedCategory || supplier.categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Show empty state
  if (suppliers.length === 0) {
    return (
      <div className="w-full py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <SupplierHeader totalSuppliers={0} />
          <div>
            <Button size="default" onClick={openAddModal} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </div>
        <EmptySuppliers onAddClick={openAddModal} />
      </div>
    );
  }

  // Main view with suppliers
  return (
    <div className="w-full py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <SupplierHeader
          totalSuppliers={suppliers.length}
          error={error?.message}
          retry={error ? () => window.location.reload() : undefined}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            size="default"
            onClick={openAddModal}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </motion.div>
      </div>

      <div className="mb-6">
        <SupplierTable
          suppliers={filteredSuppliers}
          onEditClick={openEditModal}
          onDeleteClick={openDeleteDialog}
          onBulkAction={handleBulkAction}
          selectedCategory={selectedCategory}
          onCategoryFilterChange={handleCategoryFilterChange}
        />
      </div>

      <SupplierModals
        isModalOpen={isModalOpen}
        selectedSupplier={selectedSupplier}
        isDeleteDialogOpen={isDeleteDialogOpen}
        supplierToDelete={supplierToDelete}
        onCloseModal={closeModal}
        onCloseDeleteDialog={closeDeleteDialog}
        onSaveSupplier={handleSaveSupplier}
        onDeleteSupplier={handleDeleteSupplier}
      />
    </div>
  );
}
