"use client";

import { ApiError } from "@/components/ui/api-error";
import Card from "@/components/Card";
import { useSuppliers } from "./hooks/useSuppliers";
import { useSupplierModals } from "./hooks/useSupplierModals";
import { useSupplierFilters } from "./hooks/useSupplierFilters";
import { useSupplierExport } from "./hooks/useSupplierExport";
import SupplierTable from "./components/SupplierTable";
import SupplierSearch from "./components/SupplierSearch";
import SupplierActions from "./components/SupplierActions";
import SupplierHeader from "./components/SupplierHeader";
import SupplierLoading from "./components/SupplierLoading";
import EmptySuppliers from "./components/EmptySuppliers";
import { SupplierModals } from "./components/modals";

export default function Suppliers() {
  // Use our custom hooks
  const {
    suppliers,
    isLoading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
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

  const { searchTerm, setSearchTerm, filteredSuppliers } =
    useSupplierFilters(suppliers);

  const { handleExportSuppliers } = useSupplierExport(filteredSuppliers);

  // Handle saving a supplier (either add or update)
  const handleSaveSupplier = (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    if (selectedSupplier) {
      updateSupplier(selectedSupplier.id, supplierData);
    } else {
      addSupplier(supplierData);
    }
  };

  // Handle deleting a supplier
  const handleDeleteSupplier = async () => {
    if (supplierToDelete) {
      await deleteSupplier(supplierToDelete.id);
      closeDeleteDialog();
    }
  };

  // Loading state
  if (isLoading) {
    return <SupplierLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <SupplierHeader />
        </div>

        <ApiError title="Supplier Data Error" message={error} />
      </div>
    );
  }

  // Empty state
  if (suppliers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <SupplierHeader />
          <SupplierActions
            onAddClick={openAddModal}
            onExportClick={handleExportSuppliers}
          />
        </div>

        <EmptySuppliers onAddClick={openAddModal} />

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

  // Main view with suppliers
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <SupplierHeader />
        <SupplierActions
          onAddClick={openAddModal}
          onExportClick={handleExportSuppliers}
        />
      </div>

      <SupplierSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <Card>
        <SupplierTable
          suppliers={filteredSuppliers}
          onEditClick={openEditModal}
          onDeleteClick={openDeleteDialog}
        />
      </Card>

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
