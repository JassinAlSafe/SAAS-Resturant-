'use client';

import { SubscriptionPlan } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency";

interface PlanDebugProps {
  plans: SubscriptionPlan[];
  billingInterval: 'monthly' | 'yearly';
}

export function PlanDebug({ plans, billingInterval }: PlanDebugProps) {
  const { formatCurrency } = useCurrency();
  
  if (!plans || plans.length === 0) {
    return (
      <Card className="mb-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">No Plans Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No subscription plans were found. Please check the console for errors.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4 border-blue-500">
      <CardHeader>
        <CardTitle className="text-blue-500">Plan Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Number of plans:</strong> {plans.length}</p>
        <p><strong>Current billing interval:</strong> {billingInterval}</p>
        
        <div className="mt-4">
          <h3 className="font-bold">Plan Details:</h3>
          {plans.map((plan, index) => (
            <div key={index} className="mt-2 p-2 border rounded">
              <p><strong>Name:</strong> {plan.name}</p>
              <p><strong>ID:</strong> {plan.id}</p>
              <p><strong>Price:</strong> {formatCurrency(plan.price ?? 0)}</p>
              <p><strong>Monthly Price:</strong> {formatCurrency(plan.monthlyPrice ?? 0)}</p>
              <p><strong>Yearly Price:</strong> {formatCurrency(plan.yearlyPrice ?? 0)}</p>
              <p><strong>Interval:</strong> {plan.interval}</p>
              <p><strong>Currency:</strong> {plan.currency}</p>
              <p><strong>Is Popular:</strong> {plan.isPopular ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
