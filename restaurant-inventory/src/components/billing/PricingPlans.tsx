"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Check } from "lucide-react";
import { useCurrency } from "../../lib/currency";

export const PricingPlans = () => {
  const { formatCurrency } = useCurrency();
  
  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 9.99,
      description: "Essential features for small restaurants",
      features: [
        "Basic inventory tracking",
        "Up to 100 items",
        "Email support",
        "1 user account"
      ]
    },
    {
      id: "pro",
      name: "Professional",
      price: 29.99,
      description: "Advanced features for growing businesses",
      features: [
        "Advanced inventory tracking",
        "Unlimited items",
        "Priority support",
        "Analytics dashboard",
        "Up to 5 user accounts",
        "Supplier management"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 99.99,
      description: "Complete solution for large operations",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "Unlimited user accounts",
        "Advanced reporting",
        "Multi-location support"
      ]
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className={plan.id === "pro" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-2 text-3xl font-bold">
              {formatCurrency(plan.price)}<span className="text-sm font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={plan.id === "pro" ? "default" : "outline"}>
              Choose {plan.name}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Also export as default for backward compatibility
export default PricingPlans;
