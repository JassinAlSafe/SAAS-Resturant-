"use client";

import { useState } from "react";
import { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiStar } from "react-icons/fi";
import { format } from "date-fns";
import Image from "next/image";

interface SupplierTableProps {
  suppliers: Supplier[];
  onEditClick: (supplier: Supplier) => void;
  onDeleteClick: (supplier: Supplier) => void;
  onBulkAction?: (action: string, suppliers: Supplier[]) => void;
}

export default function SupplierTable({
  suppliers,
  onEditClick,
  onDeleteClick,
  onBulkAction,
}: SupplierTableProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(
    new Set()
  );

  const handleSelectAll = () => {
    if (selectedSuppliers.size === suppliers.length) {
      setSelectedSuppliers(new Set());
    } else {
      setSelectedSuppliers(new Set(suppliers.map((s) => s.id)));
    }
  };

  const handleSelectSupplier = (supplierId: string) => {
    const newSelected = new Set(selectedSuppliers);
    if (newSelected.has(supplierId)) {
      newSelected.delete(supplierId);
    } else {
      newSelected.add(supplierId);
    }
    setSelectedSuppliers(newSelected);
  };

  const handleBulkAction = (action: string) => {
    const selectedSuppliersList = suppliers.filter((s) =>
      selectedSuppliers.has(s.id)
    );
    onBulkAction?.(action, selectedSuppliersList);
  };

  return (
    <div className="space-y-4">
      {selectedSuppliers.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedSuppliers.size} supplier(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("export")}
          >
            Export Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() => handleBulkAction("delete")}
          >
            Delete Selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedSuppliers.size === suppliers.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No suppliers found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSuppliers.has(supplier.id)}
                      onCheckedChange={() => handleSelectSupplier(supplier.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {supplier.logo ? (
                        <Image
                          src={supplier.logo}
                          alt={supplier.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-lg font-medium">
                            {supplier.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{supplier.name}</span>
                          {supplier.isPreferred && (
                            <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        {supplier.contactName && (
                          <span className="text-sm text-muted-foreground">
                            {supplier.contactName}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="text-xs"
                        >
                          {category.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {supplier.email && (
                        <div className="flex items-center text-sm">
                          <FiMail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <a
                            href={`mailto:${supplier.email}`}
                            className="text-primary hover:underline"
                          >
                            {supplier.email}
                          </a>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-sm">
                          <FiPhone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <a
                            href={`tel:${supplier.phone}`}
                            className="hover:underline"
                          >
                            {supplier.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        supplier.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {supplier.lastOrderDate
                      ? format(new Date(supplier.lastOrderDate), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => onEditClick(supplier)}
                        title="Edit supplier"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDeleteClick(supplier)}
                        title="Delete supplier"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
