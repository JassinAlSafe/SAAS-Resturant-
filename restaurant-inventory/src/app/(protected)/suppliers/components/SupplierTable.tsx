"use client";

import { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiEdit2, FiTrash2, FiMail, FiPhone } from "react-icons/fi";

interface SupplierTableProps {
  suppliers: Supplier[];
  onEditClick: (supplier: Supplier) => void;
  onDeleteClick: (supplier: Supplier) => void;
}

export default function SupplierTable({
  suppliers,
  onEditClick,
  onDeleteClick,
}: SupplierTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No suppliers found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactName || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {supplier.email && (
                      <div className="flex items-center text-sm">
                        <FiMail className="h-3 w-3 mr-1 text-muted-foreground" />
                        <a
                          href={`mailto:${supplier.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {supplier.email}
                        </a>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center text-sm mt-1">
                        <FiPhone className="h-3 w-3 mr-1 text-muted-foreground" />
                        <a
                          href={`tel:${supplier.phone}`}
                          className="hover:underline"
                        >
                          {supplier.phone}
                        </a>
                      </div>
                    )}
                    {!supplier.email && !supplier.phone && "—"}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {supplier.address || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                      onClick={() => onEditClick(supplier)}
                      title="Edit supplier"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
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
  );
}
