"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Subscription,
  PaymentMethod,
  Invoice,
  SubscriptionPlan,
} from "@/lib/types";
import { subscriptionService } from "@/lib/services/subscription-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FiAlertTriangle,
  FiCreditCard,
  FiFileText,
  FiPackage,
} from "react-icons/fi";
import { CurrentSubscription } from "@/components/billing/CurrentSubscription";
import { PlanSelector } from "@/components/billing/PlanSelector";
import { PaymentMethods } from "@/components/billing/PaymentMethods";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { AccessDenied } from "@/components/ui/access-denied";

export default function BillingPage() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission to access billing
  const hasPermission = profile?.role === "owner" || profile?.role === "admin";

  useEffect(() => {
    if (!user?.id || !hasPermission) {
      setLoading(false);
      return;
    }

    const fetchBillingData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all billing data in parallel
        const [subscriptionData, paymentMethodsData, invoicesData, plansData] =
          await Promise.all([
            subscriptionService.getSubscription(user.id),
            subscriptionService.getPaymentMethods(user.id),
            subscriptionService.getInvoices(user.id),
            subscriptionService.getSubscriptionPlans(),
          ]);

        setSubscription(subscriptionData);
        setPaymentMethods(paymentMethodsData);
        setInvoices(invoicesData);
        setPlans(plansData);
      } catch (err) {
        console.error("Error fetching billing data:", err);
        setError("Failed to load billing information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user?.id, hasPermission]);

  // Handle subscription changes
  const handleSubscriptionChange = (updatedSubscription: Subscription) => {
    setSubscription(updatedSubscription);
  };

  // Handle payment methods changes
  const handlePaymentMethodsChange = (
    updatedPaymentMethods: PaymentMethod[]
  ) => {
    setPaymentMethods(updatedPaymentMethods);
  };

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

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <FiAlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
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
            {subscription && (
              <CurrentSubscription
                subscription={subscription}
                onSubscriptionChange={handleSubscriptionChange}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Compare plans and choose the one that fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanSelector
                  plans={plans}
                  currentSubscription={subscription}
                  onSubscriptionChange={handleSubscriptionChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <PaymentMethods
              paymentMethods={paymentMethods}
              userId={user?.id || ""}
              onPaymentMethodsChange={handlePaymentMethodsChange}
            />
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="history">
            <BillingHistory invoices={invoices} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
