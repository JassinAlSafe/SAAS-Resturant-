"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { ErrorBoundary } from "@/app/(protected)/billing/error-boundary";
import {
  getSubscription,
  createPortalSession,
  createCheckoutSession,
  formatCurrency,
  formatInterval,
  Subscription,
} from "./BillingService";
import { cn } from "@/lib/utils";

interface SubscriptionManagerProps {
  businessProfileId: string;
}

// Feature item component for free plan
const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center">
    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
    <span>{children}</span>
  </div>
);

// Loading button component
const LoadingButton = ({
  isLoading,
  loadingText = "Processing...",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading: boolean;
  loadingText?: string;
}) => (
  <button
    {...props}
    disabled={isLoading || props.disabled}
    className={cn(
      "flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
      "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50",
      props.className
    )}
  >
    {isLoading ? (
      <>
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </>
    ) : (
      children
    )}
  </button>
);

export function SubscriptionManager({
  businessProfileId,
}: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscription() {
      if (!businessProfileId) return;

      try {
        setLoading(true);
        setActionLoading(false);
        const data = await getSubscription(businessProfileId);
        setSubscription(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching subscription:", error);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [businessProfileId, toast]);

  // Handle subscription management
  const handleManageSubscription = async () => {
    if (!businessProfileId) return;

    setActionLoading(true);

    try {
      const { url } = await createPortalSession({
        businessProfileId,
      });

      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again later.",
        variant: "destructive",
      });
      setActionLoading(false);
    }
  };

  // Handle subscription checkout
  const handleSubscribe = async (priceId: string) => {
    if (!businessProfileId) return;

    setActionLoading(true);

    try {
      const { url } = await createCheckoutSession({
        priceId,
        businessProfileId,
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
      setActionLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Render subscription status badge
  const renderStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;

    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case "trialing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" /> Trial
          </span>
        );
      case "past_due":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Past Due
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Error state
  if (subscription?.error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {subscription.error}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 rounded-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No subscription
  if (!subscription?.subscription_id) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            You are currently on the free plan with limited features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FeatureItem>Basic inventory management</FeatureItem>
            <FeatureItem>Up to 100 items</FeatureItem>
            <FeatureItem>1 user account</FeatureItem>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <LoadingButton
            className="w-full rounded-full bg-orange-500 hover:bg-orange-600"
            onClick={() => handleSubscribe("price_1OvXYZABCDEFGHIJKLMNOP")}
            disabled={actionLoading}
            isLoading={actionLoading}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </LoadingButton>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Pro plan includes unlimited items, multiple users, and advanced
            analytics
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Active subscription
  return (
    <Card className="border-none shadow-sm rounded-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {subscription.subscription_plan || "Unknown"} Plan
            </CardTitle>
            <CardDescription>Your current subscription details</CardDescription>
          </div>
          {renderStatusBadge(subscription.subscription_status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscription.details && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-medium">
                  {formatCurrency(
                    subscription.details.amount,
                    subscription.details.currency
                  )}{" "}
                  /{" "}
                  {formatInterval(
                    subscription.details.interval,
                    subscription.details.intervalCount
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Period Ends
                </span>
                <span className="font-medium">
                  {formatDate(subscription.subscription_current_period_end)}
                </span>
              </div>
              {subscription.subscription_status === "past_due" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Payment Issue</AlertTitle>
                  <AlertDescription>
                    We couldn&apos;t process your latest payment. Please update
                    your payment method.
                  </AlertDescription>
                </Alert>
              )}
              {subscription.details.cancelAtPeriodEnd && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">
                    Cancellation Scheduled
                  </AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Your subscription will end on{" "}
                    {formatDate(subscription.subscription_current_period_end)}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <LoadingButton
          className="w-full border border-orange-200 bg-white text-gray-700 hover:bg-orange-50 rounded-full"
          onClick={handleManageSubscription}
          disabled={actionLoading}
          isLoading={actionLoading}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Manage Subscription
        </LoadingButton>
      </CardFooter>
    </Card>
  );
}

export function SubscriptionManagerWithErrorBoundary(
  props: SubscriptionManagerProps
) {
  return (
    <ErrorBoundary>
      <SubscriptionManager {...props} />
    </ErrorBoundary>
  );
}
