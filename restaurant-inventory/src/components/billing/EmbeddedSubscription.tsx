"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { StripePaymentWrapper } from "./StripeElements";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createPaymentIntent, createSubscription } from "./BillingService";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface EmbeddedSubscriptionProps {
  businessProfileId: string;
  planId: string;
  planName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  onSuccess: (subscriptionId: string) => void;
  onCancel: () => void;
}

export function EmbeddedSubscription({
  businessProfileId,
  planId,
  planName,
  description,
  monthlyPrice,
  yearlyPrice,
  currency,
  features,
  onSuccess,
  onCancel,
}: EmbeddedSubscriptionProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"select-plan" | "payment" | "success">(
    "select-plan"
  );
  const { toast } = useToast();

  const displayPrice =
    billingInterval === "monthly" ? monthlyPrice : yearlyPrice;
  const displayInterval = billingInterval === "monthly" ? "month" : "year";

  // Format the price as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Initialize payment intent creation
  const handleContinue = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the appropriate price ID based on the billing interval
      const priceId =
        billingInterval === "monthly" ? planId : `${planId}_yearly`;

      // Create a payment intent/setup intent
      const setupIntentData = await createPaymentIntent({
        priceId,
        businessProfileId,
      });

      setClientSecret(setupIntentData.clientSecret);
      setSetupData(setupIntentData);
      setStep("payment");
    } catch (err: any) {
      console.error("Error creating payment intent:", err);
      setError(
        err.message || "Failed to initialize payment. Please try again."
      );
      toast({
        title: "Error",
        description:
          err.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle successful payment method setup
  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (!setupData) return;

    setLoading(true);

    try {
      // Create the subscription using the completed setup intent
      const subscriptionResult = await createSubscription({
        setupIntentId: setupData.setupIntentId,
        paymentMethodId: paymentIntent.payment_method,
        priceId: setupData.priceId,
        customerId: setupData.customerId,
        businessProfileId,
      });

      // Handle success
      toast({
        title: "Success",
        description: "Your subscription has been activated!",
      });

      setStep("success");
      onSuccess(subscriptionResult.subscriptionId);
    } catch (err: any) {
      console.error("Error creating subscription:", err);
      setError(
        err.message || "Failed to activate subscription. Please try again."
      );
      toast({
        title: "Error",
        description:
          err.message || "Failed to activate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render based on the current step
  if (step === "select-plan") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-none shadow-md">
          <CardHeader className="text-center">
            <CardTitle>{planName}</CardTitle>
            <CardDescription>{description}</CardDescription>

            {/* Billing interval selector */}
            <div className="flex justify-center mt-4 mb-2">
              <Tabs
                value={billingInterval}
                onValueChange={(value) =>
                  setBillingInterval(value as "monthly" | "yearly")
                }
                className="w-full"
              >
                <TabsList className="w-full flex rounded-full p-1 bg-gray-100 border-0">
                  <TabsTrigger
                    value="monthly"
                    className="flex-1 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    className="flex-1 py-2 flex items-center justify-center rounded-full data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
                  >
                    Yearly
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
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-3xl font-bold text-center">
              {formatCurrency(displayPrice)}
              <span className="text-sm font-normal text-muted-foreground">
                /{displayInterval}
              </span>
            </div>

            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white"
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="max-w-md mx-auto">
        <StripePaymentWrapper
          clientSecret={clientSecret}
          planName={planName}
          interval={billingInterval}
          price={displayPrice}
          currency={currency}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setStep("select-plan")}
          isLoading={loading}
        />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-none shadow-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle>Subscription Activated!</CardTitle>
            <CardDescription>
              You're now subscribed to the {planName} plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>
              You'll be billed {formatCurrency(displayPrice)}/{displayInterval}.
              You can manage your subscription anytime from your billing
              settings.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              onClick={() => onSuccess(setupData?.setupIntentId || "")}
              className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white"
            >
              Continue to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fallback
  return null;
}
