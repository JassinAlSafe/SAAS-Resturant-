"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { useCurrency } from "../../lib/currency";

export const BillingHistory = () => {
  const { formatCurrency } = useCurrency();
  
  // Format date helper function
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };
  
  // This would typically fetch invoice data from an API
  const invoices = [
    { id: "INV-001", date: new Date().getTime() / 1000, amount: 49.99, status: "Paid" },
    { id: "INV-002", date: new Date().getTime() / 1000 - 2592000, amount: 49.99, status: "Paid" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your past invoices and payment history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{formatDate(invoice.date)}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>{invoice.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Also export as default for backward compatibility
export default BillingHistory;
