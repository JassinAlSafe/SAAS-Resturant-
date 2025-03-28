"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, X, CreditCard, ExternalLink } from "lucide-react";
import { createCheckoutSession } from "./BillingService";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmbeddedSubscription } from "./EmbeddedSubscription";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  currency: string;
  interval: string;
  priceId: string;
  yearlyPriceId?: string;
  productId: string;
  features: PlanFeature[];
  popular?: boolean;
  comingSoon?: boolean;
}

interface PricingPlansProps {
  businessProfileId: string;
  currentPlan?: string | null;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features to get you started",
    price: 0,
    yearlyPrice: 0,
    currency: "SEK",
    interval: "month",
    priceId: "", // No price ID for free plan
    yearlyPriceId: "", // No price ID for free plan
    productId: "prod_RzCVIogVpsmUTr", // Your actual product ID
    comingSoon: true,
    features: [
      { name: "Up to 50 inventory items", included: true },
      { name: "Basic reporting", included: true },
      { name: "Single user account", included: true },
      { name: "Community support", included: true },
      { name: "Limited features", included: true },
      { name: "No supplier management", included: false },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    description: "Perfect for small restaurants just getting started",
    price: 200,
    yearlyPrice: 1650, // ~31% discount from monthly price
    currency: "SEK",
    interval: "month",
    priceId: "price_1R7cosJu6RxAPtH5956TEnrF", // Actual Stripe price ID for Pro monthly
    yearlyPriceId: "price_1R7cosJu6RxAPtH5956TEnrF", // Using same ID for yearly for testing
    productId: "prod_S1gBZqqGPIyukE", // Pro product ID
    popular: true,
    features: [
      { name: "Up to 500 inventory items", included: true },
      { name: "Basic reporting", included: true },
      { name: "1 user account", included: true },
      { name: "Email support", included: true },
      { name: "Menu planning tools", included: true },
      { name: "Supplier management", included: true },
    ],
  },
  {
    id: "pro",
    name: "Professional",
    description: "Ideal for growing restaurants with more needs",
    price: 300,
    yearlyPrice: 3000, // 16% discount from monthly price
    currency: "SEK",
    interval: "month",
    priceId: "price_PRO", // Not active yet
    yearlyPriceId: "price_PRO_YEARLY", // Not active yet
    productId: "prod_RzCVIogVpsmUTr", // Your actual product ID
    comingSoon: true,
    features: [
      { name: "Unlimited inventory items", included: true },
      { name: "Advanced reporting & analytics", included: true },
      { name: "Up to 5 user accounts", included: true },
      { name: "Priority email support", included: true },
      { name: "Menu planning tools", included: true },
      { name: "Supplier management", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For restaurant chains and large operations",
    price: 500,
    yearlyPrice: 5000, // 16% discount from monthly price
    currency: "SEK",
    interval: "month",
    priceId: "price_ENTERPRISE", // Not active yet
    yearlyPriceId: "price_ENTERPRISE_YEARLY", // Not active yet
    productId: "prod_RzCVIogVpsmUTr", // Your actual product ID
    comingSoon: true,
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Unlimited user accounts", included: true },
      { name: "Multi-location support", included: true },
      { name: "API access", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom integrations", included: true },
      { name: "24/7 phone support", included: true },
    ],
  },
];

export function PricingPlans({
  businessProfileId,
  currentPlan,
}: PricingPlansProps) {
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [showEmbeddedPayment, setShowEmbeddedPayment] = useState(false);
  const { toast } = useToast();

  // Debug state changes
  useEffect(() => {
    console.log("showEmbeddedPayment state changed:", showEmbeddedPayment);
  }, [showEmbeddedPayment]);

  // Filter to get only the standard plan
  const standardPlan = plans.find((plan) => plan.id === "standard");

  if (!standardPlan) {
    return <div>No standard plan available</div>;
  }

  const handleSubscribe = async () => {
    try {
      console.log("Subscribe button clicked!");
      // Bypass the embedded payment flow and go directly to Stripe
      alert("Redirecting to Stripe (from handleSubscribe)");
      window.location.href =
        "https://checkout.stripe.com/c/pay/cs_test_a13CXFD126kZATRDVmNBqiJJkxD0UUJfgBb1w9gJjfbOuGuAZcQEk7nkGt";

      // This won't execute if the redirect happens
      setShowEmbeddedPayment(true);
      console.log("showEmbeddedPayment set to true:", showEmbeddedPayment);
    } catch (error) {
      console.error("Error in handleSubscribe:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRedirectCheckout = async (plan: PricingPlan) => {
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
      const priceId =
        billingInterval === "yearly" && plan.yearlyPriceId
          ? plan.yearlyPriceId
          : plan.priceId;

      const { url } = await createCheckoutSession({
        priceId,
        productId: plan.productId,
        businessProfileId,
      });

      // Show loading message
      toast({
        title: "Redirecting to Stripe",
        description:
          "Please wait while we redirect you to the checkout page...",
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description:
          "Failed to create checkout session. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const isCurrentPlan = false; // Force buttons to be visible
  console.log(
    "Current Plan:",
    currentPlan,
    "Standard Plan ID:",
    standardPlan.id,
    "Is Current Plan:",
    isCurrentPlan
  );

  const displayPrice =
    billingInterval === "yearly" && standardPlan.yearlyPrice !== undefined
      ? standardPlan.yearlyPrice
      : standardPlan.price;
  const displayInterval = billingInterval === "yearly" ? "year" : "month";

  // If showing embedded payment, render that component
  if (showEmbeddedPayment) {
    // Map the features from object format to string array
    const featureStrings = standardPlan.features
      .filter((feature) => feature.included)
      .map((feature) => feature.name);

    return (
      <EmbeddedSubscription
        businessProfileId={businessProfileId}
        planId={
          billingInterval === "yearly"
            ? standardPlan.yearlyPriceId || ""
            : standardPlan.priceId
        }
        planName={standardPlan.name}
        description={standardPlan.description}
        monthlyPrice={standardPlan.price}
        yearlyPrice={standardPlan.yearlyPrice || standardPlan.price * 10}
        currency={standardPlan.currency}
        features={featureStrings}
        onSuccess={() => {
          toast({
            title: "Success",
            description: "Your subscription has been activated successfully!",
          });
          // Reload the page or update the UI to reflect subscription status
          setTimeout(() => {
            window.location.href = "/dashboard/billing?success=true";
          }, 2000);
        }}
        onCancel={() => setShowEmbeddedPayment(false)}
      />
    );
  }

  // Otherwise show the plan selection UI
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Emergency fixed button that's always visible */}
      <div className="fixed bottom-5 right-5 left-5 z-[9999]">
        <button
          type="button"
          className="w-full max-w-md mx-auto py-6 text-center font-bold text-xl rounded-full text-white bg-red-600 hover:bg-red-700 cursor-pointer shadow-xl border-4 border-white flex flex-col items-center justify-center"
          style={{ display: "block" }}
          onClick={() => {
            console.log("Emergency subscription button clicked");
            window.location.href =
              "https://checkout.stripe.com/c/pay/cs_test_a13CXFD126kZATRDVmNBqiJJkxD0UUJfgBb1w9gJjfbOuGuAZcQEk7nkGt";
          }}
        >
          <span>CLICK HERE TO SUBSCRIBE</span>
          <span className="text-sm mt-1">(Emergency Button)</span>
        </button>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">
          Our Restaurant Inventory Plan
        </h2>
        <p className="text-muted-foreground">
          Everything you need to manage your restaurant inventory efficiently
        </p>
      </div>

      {/* Billing interval selector */}
      <div className="flex justify-center mb-8">
        <Tabs
          value={billingInterval}
          onValueChange={(value) =>
            setBillingInterval(value as "monthly" | "yearly")
          }
          className="w-full max-w-md"
        >
          <TabsList className="w-full flex rounded-full p-1 bg-gray-100 border-0">
            <TabsTrigger
              value="monthly"
              className="flex-1 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
            >
              Monthly Billing
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="flex-1 py-2 flex items-center justify-center rounded-full data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
            >
              Yearly Billing
              <Badge
                variant="secondary"
                className="ml-2 bg-green-500 text-white border-0"
              >
                Save 20%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-md mx-auto">
        <Card
          className="flex flex-col overflow-hidden border-none shadow-md ring-1 ring-orange-200 rounded-xl min-h-[600px] relative"
          onClick={() => {
            console.log("Card click event occurred");
          }}
        >
          {standardPlan.popular && (
            <div className="px-3 py-1 text-xs bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-t-xl text-center font-medium">
              POPULAR
            </div>
          )}

          {/* Position an absolute button that's always visible */}
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
            <button
              type="button"
              className="w-full max-w-xs py-6 text-center font-bold rounded-full text-white bg-orange-500 hover:bg-orange-600 cursor-pointer shadow-lg border-4 border-white"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Direct subscription button clicked");
                window.location.href =
                  "https://checkout.stripe.com/c/pay/cs_test_a13CXFD126kZATRDVmNBqiJJkxD0UUJfgBb1w9gJjfbOuGuAZcQEk7nkGt";
              }}
            >
              SUBSCRIBE NOW
            </button>
          </div>

          <CardHeader className="text-center">
            <CardTitle>{standardPlan.name}</CardTitle>
            <CardDescription>{standardPlan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                {formatCurrency(displayPrice, standardPlan.currency)}
              </span>
              <span className="text-muted-foreground">/{displayInterval}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 mx-auto max-w-[260px]">
              {standardPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  {feature.included ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mr-2 text-gray-300 flex-shrink-0" />
                  )}
                  <span
                    className={feature.included ? "" : "text-muted-foreground"}
                  >
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <div className="pt-4 pb-6 px-6 flex flex-col gap-2 border-t border-orange-200 mt-4">
            <div className="text-lg font-bold text-center text-red-500 mb-2">
              Subscribe Now!
            </div>

            {/* Button for Subscribe with Card */}
            <button
              type="button"
              className={`w-full py-4 text-center font-semibold rounded-full text-white ${
                loading ? "bg-orange-300" : "bg-orange-500 hover:bg-orange-600"
              } cursor-pointer flex items-center justify-center`}
              onClick={(e) => {
                e.preventDefault();
                console.log("Button clicked - Subscribe");
                handleSubscribe();
              }}
              disabled={loading}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {loading ? "Processing..." : "Subscribe with Card"}
            </button>

            {/* Button for Checkout with Stripe */}
            <button
              type="button"
              className={`w-full py-4 text-center font-semibold rounded-full text-gray-700 border border-gray-300 ${
                loading ? "bg-gray-100" : "hover:bg-gray-100"
              } cursor-pointer mt-2 flex items-center justify-center`}
              onClick={(e) => {
                e.preventDefault();
                console.log("Button clicked - Checkout with Stripe");
                handleRedirectCheckout(standardPlan);
              }}
              disabled={loading}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {loading ? "Processing..." : "Checkout with Stripe"}
            </button>

            <button
              type="button"
              className="w-full py-4 text-center font-semibold rounded-full text-white bg-red-500 hover:bg-red-600 cursor-pointer flex items-center justify-center mt-4"
              onClick={() => {
                console.log("Direct Stripe Test Button Clicked");
                // Use a Stripe test checkout session URL
                window.location.href =
                  "https://checkout.stripe.com/c/pay/cs_test_a13CXFD126kZATRDVmNBqiJJkxD0UUJfgBb1w9gJjfbOuGuAZcQEk7nkGt#fidkdWxOYHwnPyd1blpxYHZxWjA0TjE0PW1iTGBqQGZ%2FU3diQn1RbHxAQEJoNEFTd2dMNXc0TlVCcWpSfGkzTGF9UnRhfW52VzI0YHVSTkJ2QHY0YE5CQTVDf1JCaGRdYGdhcWF3PXZ9Z0J9MScpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl";
              }}
            >
              Test Stripe Checkout (Direct URL)
            </button>
          </div>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Additional plans for growing restaurants and enterprise customers
            coming soon.
          </p>
          <p className="mt-2">
            Need a custom plan?{" "}
            <a
              href="mailto:sales@yourcompany.com"
              className="text-orange-500 hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
