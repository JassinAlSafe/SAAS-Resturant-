"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle, CreditCard, Receipt } from "lucide-react";
import { SubscriptionManager, PricingPlans } from "@/components/billing";
import * as profileService from "@/lib/services/dashboard/profile-service";

export default function DashboardBillingContent() {
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Check for success/canceled URL parameters from Stripe redirect
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  // Get the business profile ID
  useEffect(() => {
    async function fetchBusinessProfile() {
      try {
        // Get the business profile ID
        const profileId = await profileService.getBusinessProfileId();
        if (profileId) {
          setBusinessProfileId(profileId);
          
          // Get the current plan
          const plan = await profileService.getBusinessProfilePlanById(profileId);
          setCurrentPlan(plan || 'free');
        }
      } catch (error) {
        console.error("Error fetching business profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBusinessProfile();
  }, []);

  // Show success/error toast on redirect from Stripe
  useEffect(() => {
    if (success === "true") {
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated.",
        variant: "default",
      });
    } else if (canceled === "true") {
      toast({
        title: "Subscription Update Canceled",
        description: "You've canceled the subscription update process.",
        variant: "default",
      });
    }
  }, [success, canceled, toast]);

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6 text-base-content">Billing</h1>
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full bg-base-200" />
        </div>
      </div>
    );
  }

  if (!businessProfileId) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6 text-base-content">Billing</h1>
        <Alert variant="destructive" className="alert alert-error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not retrieve your business profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-base-content">Billing</h1>
      
      {success === "true" && (
        <Alert className="mb-6 alert alert-success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Subscription Updated</AlertTitle>
          <AlertDescription>
            Your subscription has been successfully updated. Thank you for your business!
          </AlertDescription>
        </Alert>
      )}
      
      {canceled === "true" && (
        <Alert className="mb-6 alert alert-warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Update Canceled</AlertTitle>
          <AlertDescription>
            You&apos;ve canceled the subscription update process. Your current subscription remains unchanged.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="subscription" className="tab tab-bordered">
            <CreditCard className="mr-2 h-4 w-4" />
            Current Subscription
          </TabsTrigger>
          <TabsTrigger value="plans" className="tab tab-bordered">
            <Receipt className="mr-2 h-4 w-4" />
            Available Plans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="card bg-base-100 shadow-md p-6">
          {businessProfileId && (
            <SubscriptionManager 
              businessProfileId={businessProfileId} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="plans" className="card bg-base-100 shadow-md p-6">
          <PricingPlans 
            businessProfileId={businessProfileId} 
            currentPlan={currentPlan}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
