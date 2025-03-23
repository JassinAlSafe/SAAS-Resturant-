"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import SubscriptionManager from "./SubscriptionManager";

export const CurrentSubscription = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Subscription</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        <SubscriptionManager />
      </CardContent>
    </Card>
  );
};

// Also export as default for backward compatibility
export default CurrentSubscription;
