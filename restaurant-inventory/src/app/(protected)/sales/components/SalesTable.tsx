"use client";

import { useState } from "react";
import { Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { salesService } from "@/lib/services/sales-service";
import {
  FiMessageSquare,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface SalesTableProps {
  sales: Sale[];
  onViewNotes?: (sale: Sale) => void;
  onRefresh?: () => void;
  canEdit?: boolean;
}

export default function SalesTable({
  sales,
  onViewNotes,
  onRefresh,
  canEdit = true,
}: SalesTableProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // State for editing
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Handle edit start
  const handleStartEdit = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditingQuantity(sale.quantity);
  };

  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditingSaleId(null);
    setEditingQuantity(0);
  };

  // Handle edit save
  const handleSaveEdit = async (sale: Sale) => {
    if (editingQuantity === sale.quantity) {
      handleCancelEdit();
      return;
    }

    if (editingQuantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    setIsSaving(true);

    try {
      // Calculate new amount
      const unitPrice = sale.totalAmount / sale.quantity;
      const updatedSale = {
        ...sale,
        quantity: editingQuantity,
        totalAmount: unitPrice * editingQuantity,
      };

      // Update the sale in the database
      const success = await salesService.updateSale(updatedSale);

      if (success) {
        toast.success("Sale updated successfully");
        // Refresh the sales list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error("Failed to update sale");
      }
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error("An error occurred while updating sale");
    } finally {
      setIsSaving(false);
      setEditingSaleId(null);
    }
  };

  // Handle delete
  const handleDelete = async (saleId: string) => {
    setIsDeleting(saleId);

    try {
      const success = await salesService.deleteSale(saleId);

      if (success) {
        toast.success("Sale deleted successfully");
        // Refresh the sales list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error("Failed to delete sale");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("An error occurred while deleting sale");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Dish</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No sales found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow
                key={sale.id}
                className={
                  editingSaleId === sale.id ? "bg-muted/20" : undefined
                }
              >
                <TableCell>{format(new Date(sale.date), "PP")}</TableCell>
                <TableCell className="font-medium">
                  {sale.dishName || "Unknown Dish"}
                </TableCell>
                <TableCell>
                  {editingSaleId === sale.id ? (
                    <Input
                      type="number"
                      min="1"
                      value={editingQuantity}
                      onChange={(e) =>
                        setEditingQuantity(parseInt(e.target.value) || 0)
                      }
                      className="w-20 h-8"
                    />
                  ) : (
                    sale.quantity
                  )}
                </TableCell>
                <TableCell>
                  {editingSaleId === sale.id
                    ? formatCurrency(
                        (sale.totalAmount / sale.quantity) * editingQuantity
                      )
                    : formatCurrency(sale.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingSaleId === sale.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(sale)}
                          disabled={isSaving}
                          className="h-8 w-8 text-green-600"
                          title="Save changes"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="h-8 w-8 text-muted-foreground"
                          title="Cancel changes"
                        >
                          <FiXCircle className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {onViewNotes && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onViewNotes(sale)}
                            title="View notes"
                          >
                            <FiMessageSquare className="h-4 w-4" />
                          </Button>
                        )}

                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600"
                              onClick={() => handleStartEdit(sale)}
                              title="Edit sale"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Delete sale"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Sale Record
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this sale
                                    record? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(sale.id)}
                                    disabled={isDeleting === sale.id}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeleting === sale.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </>
                    )}
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
