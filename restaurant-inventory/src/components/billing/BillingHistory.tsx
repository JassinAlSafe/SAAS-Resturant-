import { useState } from "react";
import { Invoice } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiDownload, FiFileText, FiExternalLink } from "react-icons/fi";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency";

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
        return <span className="badge badge-success">Paid</span>;
      case "open":
        return <span className="badge badge-outline">Pending</span>;
      case "void":
        return <span className="badge badge-secondary">Void</span>;
      case "uncollectible":
        return <span className="badge badge-error">Failed</span>;
      default:
        return <span className="badge">{status}</span>;
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
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-medium">{invoice.invoiceNumber}</td>
                    <td>
                      {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                    </td>
                    <td>{formatCurrency(invoice.amount)}</td>
                    <td>{renderStatusBadge(invoice.status)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openInvoiceDetails(invoice)}
                        >
                          <FiFileText className="mr-1 h-4 w-4" />
                          View
                        </button>
                        {invoice.pdf && (
                          <a
                            className="btn btn-ghost btn-sm"
                            href={invoice.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiDownload className="mr-1 h-4 w-4" />
                            Download
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-base-content/70">
            No billing history available yet.
          </div>
        )}
      </CardContent>

      {/* Invoice Details Modal/Dialog */}
      <dialog
        id="invoice_modal"
        className={`modal ${isInvoiceDialogOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg">
            Invoice {selectedInvoice?.invoiceNumber}
          </h3>
          <p className="text-base-content/70">Invoice details and line items</p>

          {selectedInvoice && (
            <div className="space-y-6 mt-4">
              {/* Invoice header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold">ShelfWise</h3>
                  <p className="text-sm text-base-content/70">
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
                    {selectedInvoice.dueDate
                      ? format(
                          new Date(selectedInvoice.dueDate),
                          "MMMM d, yyyy"
                        )
                      : "N/A"}
                  </div>
                  <div className="mt-2">
                    {renderStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
              </div>

              {/* Invoice items */}
              <div>
                <h4 className="font-medium mb-2">Invoice Items</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="text-right">
                          {formatCurrency(item.amount * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <a
                    className="btn btn-primary"
                    href={selectedInvoice.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiExternalLink className="mr-2 h-4 w-4" />
                    Open PDF
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="modal-action">
            <button
              className="btn"
              onClick={() => setIsInvoiceDialogOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsInvoiceDialogOpen(false)}>close</button>
        </form>
      </dialog>
    </Card>
  );
}
