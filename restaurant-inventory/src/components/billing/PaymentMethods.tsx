"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CreditCard, PlusCircle } from "lucide-react";

export const PaymentMethods = () => {
  // This would typically fetch payment methods from an API
  const paymentMethods = [
    { id: "pm_1", brand: "visa", last4: "4242", expMonth: 12, expYear: 2025 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage your payment methods</CardDescription>
      </CardHeader>
      <CardContent>
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-6 w-6" />
                  <div>
                    <p className="font-medium capitalize">{method.brand}  {method.last4}</p>
                    <p className="text-sm text-gray-500">Expires {method.expMonth}/{method.expYear}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard className="mb-2 h-12 w-12 text-gray-400" />
            <h3 className="mb-1 text-lg font-medium">No payment methods</h3>
            <p className="mb-4 text-sm text-gray-500">You haven\'t added any payment methods yet.</p>
          </div>
        )}
        <Button className="mt-4 w-full" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </CardContent>
    </Card>
  );
};

// Also export as default for backward compatibility
export default PaymentMethods;
