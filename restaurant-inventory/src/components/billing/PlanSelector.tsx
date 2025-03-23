"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useCurrency } from "../../lib/currency";

export const PlanSelector = () => {
  const { formatCurrency } = useCurrency();
  
  const plans = [
    { id: "basic", name: "Basic", price: 9.99, features: ["Basic inventory tracking", "Up to 100 items", "Email support"] },
    { id: "pro", name: "Professional", price: 29.99, features: ["Advanced inventory tracking", "Unlimited items", "Priority support", "Analytics"] },
    { id: "enterprise", name: "Enterprise", price: 99.99, features: ["Everything in Pro", "Custom integrations", "Dedicated account manager", "SLA guarantees"] },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Plan</CardTitle>
        <CardDescription>Select the plan that works best for your business</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="pro">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center space-x-2 space-y-2">
              <RadioGroupItem value={plan.id} id={plan.id} />
              <Label htmlFor={plan.id} className="flex flex-col">
                <span className="font-medium">{plan.name} - {formatCurrency(plan.price)}/month</span>
                <span className="text-sm text-gray-500">
                  {plan.features.join(", ")}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Button className="mt-4 w-full">Subscribe</Button>
      </CardContent>
    </Card>
  );
};

// Also export as default for backward compatibility
export default PlanSelector;
