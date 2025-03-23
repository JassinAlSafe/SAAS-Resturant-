"use client";

import React from "react";
import { TabsContent } from "../../components/ui/tabs";

export const BillingWrapper = ({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode 
}) => {
  return (
    <TabsContent value={id} className="mt-6">
      <div className="rounded-lg border p-4">
        {children}
      </div>
    </TabsContent>
  );
};

// Also export as default for backward compatibility
export default BillingWrapper;
