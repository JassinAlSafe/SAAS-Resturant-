"use client";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import Card from "@/components/Card";
import { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supplierService } from "@/lib/services/supplier-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import SupplierModal from "@/components/suppliers/SupplierModal";
import DeleteConfirmationDialog from "@/components/inventory/DeleteConfirmationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/ui/export-button";
import { exportToExcel, formatSuppliersForExport } from "@/lib/utils/export";

export default function Suppliers() {
  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Notifications
  const { success, error } = useNotificationHelpers();

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const fetchedSuppliers = await supplierService.getSuppliers();
      setSuppliers(fetchedSuppliers);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      error(
        "Failed to load suppliers",
        "There was an error loading your supplier data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle opening the modal for adding a new supplier
  const openAddModal = () => {
    setSelectedSupplier(undefined);
    setIsModalOpen(true);
  };

  // Handle opening the modal for editing a supplier
  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  // Handle opening the delete confirmation dialog
  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  // Handle adding a new supplier
  const handleAddSupplier = async (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newSupplier = await supplierService.addSupplier(supplierData);
      if (newSupplier) {
        setSuppliers([...suppliers, newSupplier]);
        success(
          "Supplier Added",
          `${newSupplier.name} has been added to your suppliers list.`
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Error adding supplier:", err);
      error(
        "Failed to add supplier",
        "There was an error adding this supplier."
      );
    }
  };

  // Handle updating an existing supplier
  const handleUpdateSupplier = async (
    id: string,
    supplierData: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const updatedSupplier = await supplierService.updateSupplier(
        id,
        supplierData
      );
      if (updatedSupplier) {
        setSuppliers(suppliers.map((s) => (s.id === id ? updatedSupplier : s)));
        success(
          "Supplier Updated",
          `${updatedSupplier.name} has been updated.`
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Error updating supplier:", err);
      error(
        "Failed to update supplier",
        "There was an error updating this supplier."
      );
    }
  };

  // Handle deleting a supplier
  const handleDeleteSupplier = async (id: string) => {
    try {
      const isDeleted = await supplierService.deleteSupplier(id);
      if (isDeleted) {
        setSuppliers(suppliers.filter((s) => s.id !== id));
        success(
          "Supplier Deleted",
          "The supplier has been removed from your list."
        );
        setIsDeleteDialogOpen(false);
        setSupplierToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      error(
        "Failed to delete supplier",
        "There was an error deleting this supplier."
      );
    }
  };

  // Save supplier changes (add or update)
  const handleSaveSupplier = (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    if (selectedSupplier) {
      handleUpdateSupplier(selectedSupplier.id, supplierData);
    } else {
      handleAddSupplier(supplierData);
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add the export handler function inside the component
  const handleExportSuppliers = async () => {
    try {
      // If we have suppliers in state, use those
      let dataToExport = suppliers;

      // If there are no suppliers or we need fresh data, fetch suppliers
      if (!dataToExport || dataToExport.length === 0) {
        const freshData = await supplierService.getAllSuppliers();
        dataToExport = freshData;
      }

      if (dataToExport.length === 0) {
        error("Nothing to Export", "You don't have any suppliers to export.");
        return;
      }

      // Format and export the data
      const formattedData = formatSuppliersForExport(dataToExport);
      exportToExcel(formattedData, "Suppliers", "Supplier List");

      // Show success notification
      success("Export Complete", "Suppliers have been exported to Excel.");
    } catch (err) {
      console.error("Error exporting suppliers:", err);
      error("Export Failed", "There was an error exporting your suppliers.");
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <Card>
          <div className="p-4">
            <Skeleton className="h-10 w-full max-w-md mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers and vendor contacts
          </p>
        </div>
        <div className="flex gap-2 items-center mt-4 md:mt-0">
          <ExportButton
            onExport={handleExportSuppliers}
            label="Export Excel"
            tooltipText="Download suppliers as Excel file"
            variant="outline"
          />
          <Button onClick={openAddModal} size="sm">
            <FiPlus className="mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Suppliers list */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No suppliers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>{supplier.contactName}</TableCell>
                    <TableCell>
                      {supplier.email ? (
                        <a
                          href={`mailto:${supplier.email}`}
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FiMail className="mr-1 h-4 w-4" />
                          {supplier.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {supplier.phone ? (
                        <a
                          href={`tel:${supplier.phone}`}
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FiPhone className="mr-1 h-4 w-4" />
                          {supplier.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(supplier)}
                        >
                          <FiEdit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(supplier)}
                          className="text-red-500"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Supplier modal for add/edit */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        supplier={selectedSupplier}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSupplierToDelete(null);
        }}
        onConfirm={() =>
          supplierToDelete && handleDeleteSupplier(supplierToDelete.id)
        }
        title="Delete Supplier"
        description={`Are you sure you want to delete ${supplierToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
