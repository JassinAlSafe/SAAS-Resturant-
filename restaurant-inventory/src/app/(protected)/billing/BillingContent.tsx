"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/services/auth-context";
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
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { PaymentMethods } from "@/components/billing/PaymentMethods";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { BillingWrapper } from "@/components/billing/BillingWrapper";
import { PlanSelector } from "@/components/billing/PlanSelector";
import { CurrentSubscription } from "@/components/billing/CurrentSubscription";
import { BillingTabs } from "@/components/billing/BillingTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

// Maximum number of retries for API calls
const MAX_RETRIES = 3;

// Type for API errors
interface ApiError {
  section: string;
  message: string;
  retryCount: number;
}

export default function BillingContent() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
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
  const [activeTab, setActiveTab] = useState(tabParam || "subscription");

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
        () => subscriptionService.getSubscriptionPlans("monthly"),
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

  // Handle subscription updates
  const handleSubscriptionChange = useCallback(
    (updatedSubscription: Subscription) => {
      setSubscription(updatedSubscription);
    },
    []
  );

  // Handle payment method updates
  const handlePaymentMethodsChange = useCallback(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Check if user has permission to access billing
  if (!user || !profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <Skeleton className="h-12 w-full max-w-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get next billing date
  const nextBillingDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-base-content/70">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Billing Summary Card */}
      <Card className="border-accent/20">
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Current Plan */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-base-content/70">
                Current Plan
              </h3>
              {loading.subscription ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {subscription?.plan?.name || "No active plan"}
                  </span>
                  {subscription?.status === "active" && (
                    <span className="badge badge-success badge-sm">Active</span>
                  )}
                  {subscription?.status === "canceled" && (
                    <span className="badge badge-warning badge-sm">
                      Canceled
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Next Billing */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-base-content/70">
                Next Billing
              </h3>
              {loading.subscription ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-xl font-semibold">
                  {nextBillingDate
                    ? format(nextBillingDate, "MMMM d, yyyy")
                    : "Not applicable"}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-base-content/70">
                Payment Method
              </h3>
              {loading.paymentMethods ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-xl font-semibold">
                  {paymentMethods.length > 0
                    ? `${paymentMethods[0].brand} •••• ${paymentMethods[0].last4}`
                    : "No payment method"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error alerts */}
      {errors.length > 0 && (
        <div className="alert alert-error">
          <FiAlertTriangle className="h-5 w-5" />
          <div>
            <h3 className="font-bold">Error loading billing information</h3>
            <ul className="list-disc pl-5 mt-2">
              {errors.map((error, index) => (
                <li key={index}>
                  {error.section}: {error.message}
                  <button
                    className="btn btn-ghost btn-xs ml-2"
                    onClick={() => {
                      clearErrorsForSection(error.section);
                      if (error.section === "subscription") fetchSubscription();
                      if (error.section === "paymentMethods")
                        fetchPaymentMethods();
                      if (error.section === "invoices") fetchInvoices();
                      if (error.section === "plans") fetchPlans();
                    }}
                  >
                    <FiRefreshCw className="mr-1 h-3 w-3" />
                    Retry
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Top navigation tabs */}
      <BillingTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content tabs */}
      <div className="w-full">
        {activeTab === "subscription" && (
          <BillingWrapper isLoading={loading.subscription}>
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
                    You don&apos;t have an active subscription. Choose a plan to
                    get started.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("plans")}
                  >
                    View Plans
                  </button>
                </CardFooter>
              </Card>
            )}
          </BillingWrapper>
        )}

        {activeTab === "payment-methods" && (
          <BillingWrapper isLoading={loading.paymentMethods}>
            <PaymentMethods
              paymentMethods={paymentMethods}
              onPaymentMethodsChange={handlePaymentMethodsChange}
            />
          </BillingWrapper>
        )}

        {activeTab === "billing-history" && (
          <BillingWrapper isLoading={loading.invoices}>
            <BillingHistory invoices={invoices} />
          </BillingWrapper>
        )}

        {activeTab === "plans" && (
          <BillingWrapper isLoading={loading.plans}>
            <PlanSelector
              plans={plans}
              currentSubscription={subscription}
              onSubscriptionChange={handleSubscriptionChange}
            />
          </BillingWrapper>
        )}
      </div>
    </div>
  );
}
