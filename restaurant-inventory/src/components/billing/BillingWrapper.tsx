"use client";

import { ReactNode, useEffect, useState } from "react";
import { Subscription } from "@/lib/types";
import { subscriptionService } from "@/lib/services/subscription-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FiAlertCircle } from "react-icons/fi";

interface BillingWrapperProps {
  children: ReactNode;
  userId: string;
}

export function BillingWrapper({ children, userId }: BillingWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasValidData, setHasValidData] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) {
        setLoading(false);
        setError("User ID is required");
        return;
      }

      try {
        // Fetch subscription with plan data
        const data = await subscriptionService.getSubscription(userId);
        setSubscription(data);

        // Validate subscription has a plan
        if (!data || !data.plan) {
          console.error("Invalid subscription data:", data);
          setError("Unable to load subscription data");
        } else {
          setHasValidData(true);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Show error state
  if (error || !hasValidData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Information Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-amber-600">
            <FiAlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                We couldn&apos;t load your subscription information
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {error ||
                  "Please try again later or contact support if the problem persists."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Context is valid, render children
  return <>{children}</>;
}
