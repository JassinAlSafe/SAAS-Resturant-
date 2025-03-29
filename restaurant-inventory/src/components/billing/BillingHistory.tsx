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
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Paid
          </span>
        );
      case "open":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Pending
          </span>
        );
      case "void":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Void
          </span>
        );
      case "uncollectible":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-lg pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">
          Billing History
        </CardTitle>
        <CardDescription className="text-gray-600">
          View your past invoices and payment history
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-none">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {renderStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 border-0 shadow-sm transition-colors"
                          onClick={() => openInvoiceDetails(invoice)}
                        >
                          <FiFileText className="mr-1 h-3.5 w-3.5" />
                          View
                        </button>
                        {invoice.pdf && (
                          <a
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 border-0 shadow-sm transition-colors"
                            href={invoice.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiDownload className="mr-1 h-3.5 w-3.5" />
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
          <div className="text-center py-8 text-gray-500">
            No billing history available yet.
          </div>
        )}
      </CardContent>

      {/* Invoice Details Modal/Dialog */}
      <dialog
        id="invoice_modal"
        className={`modal ${isInvoiceDialogOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box max-w-3xl bg-white rounded-lg shadow-xl border border-gray-200 p-0">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Invoice {selectedInvoice?.invoiceNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Invoice details and line items
            </p>
          </div>

          {selectedInvoice && (
            <div className="px-6 py-5 space-y-6">
              {/* Invoice header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 pb-5 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">ShelfWise</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    123 Restaurant Ave
                    <br />
                    San Francisco, CA 94107
                    <br />
                    United States
                  </p>
                </div>

                <div className="md:text-right">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Invoice Number:
                      </span>{" "}
                      <span className="text-gray-900">
                        {selectedInvoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Invoice Date:
                      </span>{" "}
                      <span className="text-gray-900">
                        {format(
                          new Date(selectedInvoice.invoiceDate),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Due Date:
                      </span>{" "}
                      <span className="text-gray-900">
                        {selectedInvoice.dueDate
                          ? format(
                              new Date(selectedInvoice.dueDate),
                              "MMMM d, yyyy"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="mt-2">
                      {renderStatusBadge(selectedInvoice.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Invoice Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-none">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-200">
                        <th className="px-4 py-2 text-sm font-medium text-gray-700">
                          Description
                        </th>
                        <th className="px-4 py-2 text-sm font-medium text-gray-700 text-right">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-sm font-medium text-gray-700 text-right">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-sm font-medium text-gray-700 text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium text-right">
                            {formatCurrency(item.amount * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice total */}
              <div className="flex justify-end mt-4">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">
                      {formatCurrency(selectedInvoice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base border-t border-gray-200 pt-3 mt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-orange-600">
                      {formatCurrency(selectedInvoice.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice actions */}
              {selectedInvoice.pdf && (
                <div className="flex justify-end gap-2 pt-4">
                  <a
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full font-medium text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 border-0 shadow-sm transition-colors"
                    href={selectedInvoice.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiExternalLink className="mr-2 h-4 w-4" />
                    Open PDF
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              className="inline-flex items-center justify-center px-4 py-2 rounded-full font-medium text-white bg-gradient-to-r from-gray-500 to-gray-400 hover:from-gray-600 hover:to-gray-500 border-0 shadow-sm transition-colors"
              onClick={() => setIsInvoiceDialogOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => setIsInvoiceDialogOpen(false)}
            className="bg-transparent text-transparent"
          >
            Close
          </button>
        </form>
      </dialog>
    </Card>
  );
}
