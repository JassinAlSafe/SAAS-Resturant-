"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle, CreditCard, Receipt } from "lucide-react";
import { SubscriptionManager, PricingPlans } from "@/components/billing";
import * as profileService from "@/lib/services/dashboard/profile-service";

// Component to handle URL params
function BillingStatusHandler({ setSuccess, setCanceled }: { 
  setSuccess: (value: boolean) => void;
  setCanceled: (value: boolean) => void;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check for success/canceled URL parameters from Stripe redirect
    const successParam = searchParams.get("success");
    const canceledParam = searchParams.get("canceled");
    
    if (successParam === "true") {
      setSuccess(true);
    }
    
    if (canceledParam === "true") {
      setCanceled(true);
    }
  }, [searchParams, setSuccess, setCanceled]);
  
  return null;
}

export default function BillingPage() {
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const { toast } = useToast();

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
    if (success) {
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated.",
        variant: "default",
      });
    } else if (canceled) {
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
        <h1 className="text-3xl font-bold mb-6">Billing</h1>
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!businessProfileId) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Billing</h1>
        <Alert variant="destructive">
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
      <h1 className="text-3xl font-bold mb-6">Billing</h1>
      
      <Suspense fallback={null}>
        <BillingStatusHandler setSuccess={setSuccess} setCanceled={setCanceled} />
      </Suspense>
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Subscription Updated</AlertTitle>
          <AlertDescription className="text-green-700">
            Your subscription has been successfully updated. Thank you for your business!
          </AlertDescription>
        </Alert>
      )}
      
      {canceled && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Subscription Update Canceled</AlertTitle>
          <AlertDescription className="text-amber-700">
            You've canceled the subscription update process. Your current plan remains unchanged.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subscription">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Receipt className="mr-2 h-4 w-4" />
            Plans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : businessProfileId ? (
            <SubscriptionManager businessProfileId={businessProfileId} />
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Could not load your business profile. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="plans" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : businessProfileId ? (
            <PricingPlans businessProfileId={businessProfileId} currentPlan={currentPlan} />
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Could not load your business profile. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
