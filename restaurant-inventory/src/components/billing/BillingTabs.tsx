"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

export const BillingTabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tabs defaultValue="subscription" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        <TabsTrigger value="billing-history">Billing History</TabsTrigger>
        <TabsTrigger value="plans">Plans</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

// Also export as default for backward compatibility
export default BillingTabs;
