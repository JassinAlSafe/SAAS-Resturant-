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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

function SuppliersContent() {
  const {
    suppliers,
    isLoading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    bulkDeleteSuppliers,
    isDeletingSupplier,
    isBulkDeletingSuppliers,
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

  const { handleExportSuppliers, isExporting } = useSupplierExport(suppliers);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategory | null>(
    null
  );

  // Filter suppliers based on search term and category
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchTerm === "" ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === null || 
      (supplier.categories && 
       supplier.categories.includes(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  // Handle bulk actions
  const handleBulkAction = async (action: string, suppliers: Supplier[]) => {
    if (action === "delete") {
      try {
        await bulkDeleteSuppliers(suppliers.map((s) => s.id));
        toast.success(`Successfully deleted ${suppliers.length} suppliers`);
      } catch (error) {
        toast.error("Failed to delete suppliers");
        console.error(error);
      }
    } else if (action === "export") {
      try {
        handleExportSuppliers();
        toast.success(`Successfully exported ${suppliers.length} suppliers`);
      } catch (error) {
        toast.error("Failed to export suppliers");
        console.error(error);
      }
    }
  };

  // Handle save supplier (add or update)
  const handleSaveSupplier = async (data: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (selectedSupplier) {
        await updateSupplier({ 
          id: selectedSupplier.id, 
          data 
        });
        toast.success("Supplier updated successfully");
      } else {
        await addSupplier(data);
        toast.success("Supplier added successfully");
      }
      closeModal();
    } catch (error) {
      toast.error("Failed to save supplier");
      console.error(error);
    }
  };

  // Handle delete supplier
  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplier(supplierToDelete.id);
      toast.success("Supplier deleted successfully");
      closeDeleteDialog();
    } catch (error) {
      toast.error("Failed to delete supplier");
      console.error(error);
    }
  };

  if (error) {
    return (
      <ApiError 
        title="Error Loading Suppliers"
        message={error.message || "An error occurred while loading suppliers"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SupplierHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={openAddModal}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        isExporting={isExporting}
        onExportClick={() => handleExportSuppliers()}
      />

      {isLoading ? (
        <SupplierLoading />
      ) : filteredSuppliers.length === 0 ? (
        <EmptySuppliers onAddClick={openAddModal} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <SupplierTable
            suppliers={filteredSuppliers}
            onEditClick={openEditModal}
            onDeleteClick={openDeleteDialog}
            onBulkAction={handleBulkAction}
            isDeleting={isDeletingSupplier}
            isBulkDeleting={isBulkDeletingSuppliers}
            isExporting={isExporting}
          />
        </motion.div>
      )}

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

// Wrap the app with React Query provider
export default function SuppliersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuppliersContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
