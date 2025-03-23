"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Check, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getBusinessProfileId } from "@/lib/services/dashboard/profile-service"

// Mock data for subscription plans
const subscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "For small restaurants just getting started",
    price: "$29",
    features: ["Up to 3 users", "Basic inventory management", "Sales tracking", "Email support"],
    current: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing restaurants with more needs",
    price: "$49",
    features: [
      "Up to 10 users",
      "Advanced inventory management",
      "Sales forecasting",
      "Supplier integrations",
      "Priority email support",
    ],
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large restaurants or chains",
    price: "$99",
    features: [
      "Unlimited users",
      "Multi-location support",
      "Advanced analytics",
      "Custom integrations",
      "API access",
      "Dedicated support",
    ],
    current: false,
  },
]

export default function BillingSettings() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSubscriptionData() {
      try {
        setLoading(true);
        
        // Get the business profile ID
        const profileId = await getBusinessProfileId();
        setBusinessProfileId(profileId);
        
        if (!profileId) {
          throw new Error("Business profile not found");
        }
        
        // Fetch subscription data
        const response = await fetch(`/api/billing/get-subscription?businessProfileId=${profileId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch subscription data");
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubscriptionData();
  }, [toast]);

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle subscription management
  const handleManageSubscription = async () => {
    if (!businessProfileId) return;
    
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessProfileId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  // Handle subscription checkout
  const handleSubscribe = async (priceId: string) => {
    if (!businessProfileId) return;
    
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId,
          businessProfileId 
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="subscription" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        <TabsTrigger value="history">Billing History</TabsTrigger>
      </TabsList>

      <TabsContent value="subscription" className="mt-6 space-y-6">
        {loading ? (
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading subscription information...</p>
              </div>
            </CardContent>
          </Card>
        ) : subscription?.subscription_id ? (
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Manage your subscription plan and billing cycle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{subscription.subscription_plan || "Professional"} Plan</h3>
                    <Badge className={subscription.subscription_status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                      {subscription.subscription_status === 'active' ? 'Active' : subscription.subscription_status || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription.details ? 
                      `Billed ${subscription.details.interval || 'monthly'} at ${
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: subscription.details.currency || 'USD'
                        }).format((subscription.details.amount || 0) / 100)
                      }` : 
                      'Subscription active'
                    }
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={handleManageSubscription}>Manage Subscription</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Subscription Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Next billing date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(subscription.subscription_current_period_end)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Billing cycle</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.details?.interval ? 
                        `${subscription.details.interval.charAt(0).toUpperCase() + subscription.details.interval.slice(1)}${
                          subscription.details.intervalCount > 1 ? ` (${subscription.details.intervalCount} ${subscription.details.interval}s)` : ''
                        }` : 
                        'Monthly'
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.subscription_status ? 
                        subscription.subscription_status.charAt(0).toUpperCase() + subscription.subscription_status.slice(1) : 
                        'Unknown'
                      }
                    </p>
                  </div>
                  {subscription.details?.cancelAtPeriodEnd && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-700">Cancellation scheduled</p>
                      <p className="text-sm text-muted-foreground">
                        Your subscription will end on {formatDate(subscription.subscription_current_period_end)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>Choose a subscription plan to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Free Plan</h3>
                    <Badge variant="outline">Current Plan</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Limited features available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Available Plans</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {subscriptionPlans.map((plan) => {
              // Determine if this is the current plan
              const isCurrent = subscription?.subscription_plan?.toLowerCase() === plan.name.toLowerCase();
              
              return (
                <Card key={plan.id} className={isCurrent ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground"> /month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // These are placeholder price IDs - you'll need to replace with your actual Stripe price IDs
                          const priceIds = {
                            starter: "price_starter123",
                            professional: "price_professional456",
                            enterprise: "price_enterprise789"
                          };
                          handleSubscribe(priceIds[plan.id as keyof typeof priceIds]);
                        }}
                      >
                        {plan.id === "starter" ? "Downgrade" : "Upgrade"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="payment" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods and billing information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription?.subscription_id ? (
              <div className="space-y-4">
                <h3 className="font-medium">Saved Payment Methods</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment methods are managed through Stripe. Click the button below to manage your payment methods.
                </p>
                <Button onClick={handleManageSubscription}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Payment Methods
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any payment methods saved. Subscribe to a plan to add a payment method.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your past invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription?.subscription_id ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your billing history is managed through Stripe. Click the button below to view your invoices.
                </p>
                <Button onClick={handleManageSubscription}>
                  <Download className="mr-2 h-4 w-4" />
                  View Invoices
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No billing history available. Subscribe to a plan to see your invoices here.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
