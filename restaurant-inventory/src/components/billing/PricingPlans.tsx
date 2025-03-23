"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, X, RefreshCw, CreditCard } from "lucide-react";
import { createCheckoutSession } from "./BillingService";
import { useToast } from "@/components/ui/use-toast";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  priceId: string;
  productId: string;
  features: PlanFeature[];
  popular?: boolean;
}

interface PricingPlansProps {
  businessProfileId: string;
  currentPlan?: string | null;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for small restaurants",
    price: 0,
    currency: "USD",
    interval: "month",
    priceId: "", // No price ID for free plan
    productId: "prod_RzCVIogVpsmUTr", // Your actual product ID
    features: [
      { name: "Up to 100 inventory items", included: true },
      { name: "Basic inventory management", included: true },
      { name: "Single user account", included: true },
      { name: "Daily inventory reports", included: true },
      { name: "Advanced analytics", included: false },
      { name: "Multiple user accounts", included: false },
      { name: "Unlimited inventory items", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Everything you need for growing restaurants",
    price: 29,
    currency: "USD",
    interval: "month",
    priceId: "price_XXXX", // TODO: Replace with your actual Stripe price ID for Pro monthly
    productId: "prod_RzCVIogVpsmUTr", // Your actual product ID
    popular: true,
    features: [
      { name: "Up to 100 inventory items", included: true },
      { name: "Basic inventory management", included: true },
      { name: "Single user account", included: true },
      { name: "Daily inventory reports", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Multiple user accounts", included: true },
      { name: "Unlimited inventory items", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Advanced features for large restaurant chains",
    price: 99,
    currency: "USD",
    interval: "month",
    priceId: "price_YYYY", // TODO: Replace with your actual Stripe price ID for Enterprise monthly
    productId: "prod_RzCVIogVpsmUTr", // Your actual product ID
    features: [
      { name: "Up to 100 inventory items", included: true },
      { name: "Basic inventory management", included: true },
      { name: "Single user account", included: true },
      { name: "Daily inventory reports", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Multiple user accounts", included: true },
      { name: "Unlimited inventory items", included: true },
      { name: "Priority support", included: true },
    ],
  },
];

export function PricingPlans({ businessProfileId, currentPlan }: PricingPlansProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string, productId: string) => {
    if (!businessProfileId) {
      toast({
        title: "Error",
        description: "Business profile ID is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { url } = await createCheckoutSession({ 
        priceId, 
        productId,
        businessProfileId 
      });
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan?.toLowerCase() === plan.id.toLowerCase();

        return (
          <Card
            key={plan.id}
            className={`flex flex-col ${plan.popular ? 'border-primary shadow-md' : ''}`}
          >
            {plan.popular && (
              <div className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-t-sm text-center font-medium">
                MOST POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatCurrency(plan.price, plan.currency)}
                </span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.included ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 mr-2 text-gray-300" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
                disabled={isCurrentPlan || loading}
                onClick={() => handleSubscribe(plan.priceId, plan.productId)}
              >
                {loading && plan.id === "pro" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : (
                  <>
                    {plan.id === "free" ? "Get Started" : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscribe
                      </>
                    )}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
