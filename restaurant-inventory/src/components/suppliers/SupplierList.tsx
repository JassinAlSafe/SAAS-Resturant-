import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/types/database.types";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SupplierList() {
  const { suppliers, isLoading, error, deleteSupplier, isDeleting } =
    useSuppliers();

  // For demo purposes - would be handled by a modal or separate form component
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading suppliers...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
        Error loading suppliers: {error.message}
      </div>
    );
  }

  const handleDelete = (id: string) => {
    setDeleteId(id);
    // In real app, would show confirmation dialog
    if (confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplier(id);
    }
    setDeleteId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Suppliers</span>
          <Button size="sm">Add Supplier</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No suppliers found. Add your first supplier to get started.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {supplier.name}
                      {supplier.is_preferred && (
                        <Badge variant="outline" className="ml-2 bg-amber-50">
                          Preferred
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        supplier.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {supplier.contact_name && (
                      <div>{supplier.contact_name}</div>
                    )}
                    {supplier.email && (
                      <div className="text-xs text-muted-foreground">
                        {supplier.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {supplier.categories?.map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(supplier.id)}
                      disabled={isDeleting && deleteId === supplier.id}
                    >
                      {isDeleting && deleteId === supplier.id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
