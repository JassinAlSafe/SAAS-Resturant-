"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, BadgeProps } from "@/components/ui/badge";
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
  ShieldCheck
} from "lucide-react";
import { 
  getSubscription, 
  createPortalSession, 
  createCheckoutSession, 
  formatCurrency, 
  formatInterval,
  Subscription 
} from "./BillingService";

interface SubscriptionManagerProps {
  businessProfileId: string;
}

export function SubscriptionManager({ businessProfileId }: SubscriptionManagerProps) {
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
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error fetching subscription:', error);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
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
      console.error('Error creating portal session:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again later.',
        variant: 'destructive',
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
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again later.',
        variant: 'destructive',
      });
      setActionLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to get status badge variant
  const getStatusVariant = (status: string | null | undefined): BadgeProps['variant'] => {
    if (!status) return 'outline';
    
    switch (status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      case 'past_due':
        return 'warning';
      case 'canceled':
      case 'unpaid':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Render subscription status badge
  const renderStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case "active":
        return (
          <Badge variant={getStatusVariant(status)} className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case "trialing":
        return (
          <Badge variant={getStatusVariant(status)} className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="w-3 h-3 mr-1" /> Trial
          </Badge>
        );
      case "past_due":
        return (
          <Badge variant={getStatusVariant(status)} className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Past Due
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant={getStatusVariant(status)} className="bg-gray-50 text-gray-700 border-gray-200">
            Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant={getStatusVariant(status)}>{status}</Badge>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {subscription.error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
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
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            You are currently on the free plan with limited features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Basic inventory management</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Up to 100 items</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>1 user account</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => handleSubscribe("price_1OvXYZABCDEFGHIJKLMNOP")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Pro plan includes unlimited items, multiple users, and advanced analytics
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Active subscription
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {subscription.subscription_plan || "Unknown"} Plan
            </CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
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
                  {formatCurrency(subscription.details.amount, subscription.details.currency)} / {formatInterval(subscription.details.interval, subscription.details.intervalCount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Period Ends</span>
                <span className="font-medium">
                  {formatDate(subscription.subscription_current_period_end)}
                </span>
              </div>
              {subscription.subscription_status === "past_due" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Payment Issue</AlertTitle>
                  <AlertDescription>
                    We couldn&apos;t process your latest payment. Please update your payment method.
                  </AlertDescription>
                </Alert>
              )}
              {subscription.details.cancelAtPeriodEnd && (
                <Alert variant="warning" className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Cancellation Scheduled</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Your subscription will end on {formatDate(subscription.subscription_current_period_end)}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleManageSubscription}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
