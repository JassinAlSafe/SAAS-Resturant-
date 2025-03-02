"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  PaymentMethod,
  Invoice,
  Subscription,
  SubscriptionPlan,
} from "@/lib/types";
import { subscriptionService } from "@/lib/services/subscription-service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  FiAlertTriangle,
  FiPackage,
  FiCreditCard,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";
import { AccessDenied } from "@/components/ui/access-denied";
import { ErrorBoundary } from "./error-boundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentMethods } from "@/components/billing/PaymentMethods";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { BillingWrapper } from "@/components/billing/BillingWrapper";
import { PlanSelector } from "@/components/billing/PlanSelector";
import { CurrentSubscription } from "@/components/billing/CurrentSubscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Maximum number of retries for API calls
const MAX_RETRIES = 3;

// Type for API errors
interface ApiError {
  section: string;
  message: string;
  retryCount: number;
}

export default function BillingPage() {
  const { user, profile } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState({
    subscription: false,
    paymentMethods: false,
    invoices: false,
    plans: false,
  });
  const [errors, setErrors] = useState<ApiError[]>([]);

  // Retry an API call with exponential backoff
  const retryApiCall = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      section: string,
      maxRetries: number = MAX_RETRIES
    ): Promise<T | null> => {
      let retryCount = 0;
      let lastError: Error | unknown;

      while (retryCount < maxRetries) {
        try {
          return await apiCall();
        } catch (error) {
          retryCount++;
          lastError = error;

          // Don't add error to state until we've exhausted all retries
          if (retryCount >= maxRetries) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";

            setErrors((prev) => [
              ...prev,
              { section, message: errorMessage, retryCount },
            ]);
          }

          // Exponential backoff: wait longer between each retry
          const delay = Math.min(1000 * 2 ** retryCount, 8000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      console.error(
        `Failed to load ${section} after ${maxRetries} retries:`,
        lastError
      );
      return null;
    },
    []
  );

  // Clear errors for a specific section
  const clearErrorsForSection = useCallback((section: string) => {
    setErrors((prev) => prev.filter((error) => error.section !== section));
  }, []);

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    if (!user?.id) return;

    clearErrorsForSection("subscription");
    setLoading((prev) => ({ ...prev, subscription: true }));

    try {
      const data = await retryApiCall(
        () => subscriptionService.getSubscription(user.id),
        "subscription"
      );

      if (data) {
        setSubscription(data);
      }
    } finally {
      setLoading((prev) => ({ ...prev, subscription: false }));
    }
  }, [user?.id, retryApiCall, clearErrorsForSection]);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!user?.id) return;

    clearErrorsForSection("paymentMethods");
    setLoading((prev) => ({ ...prev, paymentMethods: true }));

    try {
      const data = await retryApiCall(
        () => subscriptionService.getPaymentMethods(user.id),
        "paymentMethods"
      );

      if (data) {
        setPaymentMethods(data);
      }
    } finally {
      setLoading((prev) => ({ ...prev, paymentMethods: false }));
    }
  }, [user?.id, retryApiCall, clearErrorsForSection]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!user?.id) return;

    clearErrorsForSection("invoices");
    setLoading((prev) => ({ ...prev, invoices: true }));

    try {
      const data = await retryApiCall(
        () => subscriptionService.getInvoices(user.id),
        "invoices"
      );

      if (data) {
        setInvoices(data);
      }
    } finally {
      setLoading((prev) => ({ ...prev, invoices: false }));
    }
  }, [user?.id, retryApiCall, clearErrorsForSection]);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    clearErrorsForSection("plans");
    setLoading((prev) => ({ ...prev, plans: true }));

    try {
      const data = await retryApiCall(
        () => subscriptionService.getSubscriptionPlans(),
        "plans"
      );

      if (data) {
        setPlans(data);
      }
    } finally {
      setLoading((prev) => ({ ...prev, plans: false }));
    }
  }, [retryApiCall, clearErrorsForSection]);

  // Fetch all data on initial load
  useEffect(() => {
    if (!user?.id) return;

    fetchSubscription();
    fetchPaymentMethods();
    fetchInvoices();
    fetchPlans();
  }, [
    user?.id,
    fetchSubscription,
    fetchPaymentMethods,
    fetchInvoices,
    fetchPlans,
  ]);

  // Handle subscription changes
  const handleSubscriptionChange = useCallback(
    (updatedSubscription: Subscription) => {
      setSubscription(updatedSubscription);
    },
    []
  );

  // Handle payment methods changes
  const handlePaymentMethodsChange = useCallback(
    (updatedPaymentMethods: PaymentMethod[]) => {
      setPaymentMethods(updatedPaymentMethods);
    },
    []
  );

  // Check if user has permission to access billing
  const hasPermission = profile?.role === "owner" || profile?.role === "admin";

  // If user doesn't have permission, show access denied
  if (!hasPermission) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You don't have permission to access billing information. Please contact your administrator."
        icon={<FiAlertTriangle className="h-10 w-10" />}
      />
    );
  }

  // Render error message with retry button
  const renderError = (error: ApiError) => (
    <Alert
      variant="destructive"
      key={`${error.section}-${error.retryCount}`}
      className="mb-4"
    >
      <FiAlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading {error.section}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error.message}</span>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            // Call the appropriate fetch function based on section
            if (error.section === "subscription") fetchSubscription();
            else if (error.section === "paymentMethods") fetchPaymentMethods();
            else if (error.section === "invoices") fetchInvoices();
            else if (error.section === "plans") fetchPlans();
          }}
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );

  return (
    <ErrorBoundary>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        {/* Display any errors at the top */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error) => renderError(error))}
          </div>
        )}

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="subscription">
              <FiPackage className="mr-2 h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="payment">
              <FiCreditCard className="mr-2 h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="history">
              <FiFileText className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {loading.subscription ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : (
              <BillingWrapper userId={user?.id || ""}>
                {/* If we have subscription data, show the current plan */}
                {subscription ? (
                  <CurrentSubscription
                    subscription={subscription}
                    onSubscriptionChange={handleSubscriptionChange}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Active Subscription</CardTitle>
                      <CardDescription>
                        You don't have an active subscription yet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-6">
                        <FiAlertTriangle className="text-amber-500 mr-2" />
                        <p>Choose a plan below to get started</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Available plans */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Plans</CardTitle>
                    <CardDescription>
                      Compare plans and choose the one that fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading.plans ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <PlanSelector
                        plans={plans}
                        currentSubscription={subscription}
                        onSubscriptionChange={handleSubscriptionChange}
                      />
                    )}
                  </CardContent>
                </Card>
              </BillingWrapper>
            )}
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            {loading.paymentMethods ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <PaymentMethods
                paymentMethods={paymentMethods}
                userId={user?.id || ""}
                onPaymentMethodsChange={handlePaymentMethodsChange}
              />
            )}
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="history" className="space-y-6">
            {loading.invoices ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <BillingHistory invoices={invoices} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
