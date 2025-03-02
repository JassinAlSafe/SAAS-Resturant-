import { useState } from "react";
import { Invoice } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiDownload, FiFileText, FiExternalLink } from "react-icons/fi";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency-context";

interface BillingHistoryProps {
  invoices: Invoice[];
}

export function BillingHistory({ invoices }: BillingHistoryProps) {
  const { formatCurrency } = useCurrency();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  // Open invoice details dialog
  const openInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDialogOpen(true);
  };

  // Render invoice status badge
  const renderStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "open":
        return <Badge variant="outline">Pending</Badge>;
      case "void":
        return <Badge variant="secondary">Void</Badge>;
      case "uncollectible":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          View your past invoices and payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => openInvoiceDetails(invoice)}
                        >
                          <FiFileText className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        {invoice.pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            asChild
                          >
                            <a
                              href={invoice.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiDownload className="mr-1 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No billing history available yet.
          </div>
        )}
      </CardContent>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              Invoice details and line items
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold">ShelfWise</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Restaurant Ave
                    <br />
                    San Francisco, CA 94107
                    <br />
                    United States
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm">
                    <span className="font-medium">Invoice Number:</span>{" "}
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Invoice Date:</span>{" "}
                    {format(
                      new Date(selectedInvoice.invoiceDate),
                      "MMMM d, yyyy"
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Due Date:</span>{" "}
                    {format(new Date(selectedInvoice.dueDate), "MMMM d, yyyy")}
                  </div>
                  <div className="mt-2">
                    {renderStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              {/* Invoice items */}
              <div>
                <h4 className="font-medium mb-2">Invoice Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice total */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Invoice actions */}
              <div className="flex justify-end gap-2 pt-4">
                {selectedInvoice.pdf && (
                  <Button asChild>
                    <a
                      href={selectedInvoice.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiExternalLink className="mr-2 h-4 w-4" />
                      Open PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
