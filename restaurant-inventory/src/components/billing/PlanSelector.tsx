import { useState } from "react";
import { SubscriptionPlan, Subscription } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiCheck, FiRefreshCw } from "react-icons/fi";
import { useCurrency } from "@/lib/currency";
import { subscriptionService } from "@/lib/services/subscription-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface PlanSelectorProps {
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  onSubscriptionChange: (subscription: Subscription) => void;
}

export function PlanSelector({
  plans,
  currentSubscription,
  onSubscriptionChange,
}: PlanSelectorProps) {
  const { formatCurrency } = useCurrency();
  const { success, error: showError } = useNotificationHelpers();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Safe default to monthly if no current subscription
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    currentSubscription?.plan?.interval === "year" ? "yearly" : "monthly"
  );

  // Filter to only show the Standard plan
  const standardPlan = plans.find(
    (plan) =>
      plan.name.toLowerCase() === "standard" ||
      plan.name.toLowerCase() === "basic"
  );

  if (!standardPlan) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No standard plan available</h2>
        <p className="text-muted-foreground">
          Please contact support for assistance.
        </p>
      </div>
    );
  }

  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setIsConfirmDialogOpen(true);
  };

  // Handle plan change confirmation
  const handleConfirmPlanChange = async () => {
    if (!selectedPlanId || !currentSubscription) return;

    setIsLoading(true);
    try {
      const updatedSubscription = await subscriptionService.changePlan(
        currentSubscription.userId,
        selectedPlanId,
        billingInterval
      );
      success(
        "Plan Changed",
        "Your subscription plan has been updated successfully."
      );
      onSubscriptionChange(updatedSubscription);
    } catch (err) {
      console.error("Error changing plan:", err);
      showError(
        "Plan Change Failed",
        "There was a problem updating your subscription plan. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
    }
  };

  // Get selected plan details
  const getSelectedPlan = () => {
    if (!selectedPlanId) return null;
    return plans.find((plan) => plan.id === selectedPlanId);
  };

  const selectedPlan = getSelectedPlan();
  const isCurrentPlan = currentSubscription?.planId === standardPlan.id;

  // Determine the correct price based on billing interval
  const displayPrice =
    billingInterval === "monthly"
      ? standardPlan.monthlyPrice || standardPlan.price
      : standardPlan.yearlyPrice || standardPlan.price;

  return (
    <div id="plans" className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Available Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your business needs
        </p>
      </div>

      {/* Billing interval selector */}
      <div className="flex justify-center mb-8">
        <Tabs
          value={billingInterval}
          onValueChange={(value) =>
            setBillingInterval(value as "monthly" | "yearly")
          }
          className="w-full max-w-md"
        >
          <TabsList className="w-full flex rounded-full p-1 bg-gray-100 border-0">
            <TabsTrigger
              value="monthly"
              className="flex-1 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
            >
              Monthly Billing
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="flex-1 py-2 flex items-center justify-center rounded-full data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
            >
              Yearly Billing
              <Badge
                variant="secondary"
                className="ml-2 bg-gradient-to-r from-green-500 to-green-400 text-white border-0"
              >
                Save 20%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Single Plan Card */}
      <div className="max-w-md mx-auto">
        <Card className="flex flex-col overflow-hidden border-none shadow-md ring-1 ring-orange-200 rounded-xl">
          {standardPlan.isPopular && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-3 py-1 text-xs font-medium rounded-bl-xl">
              Popular
            </div>
          )}

          <CardHeader className="text-center">
            <CardTitle>{standardPlan.name}</CardTitle>
            <CardDescription>{standardPlan.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 flex-grow">
            <div className="text-3xl font-bold text-center">
              {formatCurrency(displayPrice ?? 0)}
              <span className="text-sm font-normal text-muted-foreground">
                /{billingInterval === "monthly" ? "month" : "year"}
              </span>
            </div>

            <ul className="space-y-2 mx-auto max-w-[260px]">
              {standardPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <div className="p-6 pt-2 pb-6 mt-auto">
            {currentSubscription ? (
              // Show the "Select Plan" button for existing subscribers
              <Button
                className={cn(
                  "w-full rounded-full py-6 text-white border-0 shadow-sm",
                  isCurrentPlan
                    ? "bg-gradient-to-r from-gray-400 to-gray-300 hover:from-gray-500 hover:to-gray-400"
                    : "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
                )}
                variant="default"
                disabled={isCurrentPlan || isLoading}
                onClick={() => handleSelectPlan(standardPlan.id)}
              >
                {isCurrentPlan ? "Current Plan" : "Select Plan"}
              </Button>
            ) : (
              // Show the "Subscribe Now" button for new users
              <Button
                className="w-full rounded-full py-6 text-white border-0 shadow-sm bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
                variant="default"
                onClick={() => {
                  window.open(
                    "https://buy.stripe.com/5kA7tn8yHa255wceUU",
                    "_blank"
                  );
                }}
              >
                Subscribe Now
              </Button>
            )}
          </div>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Additional plans for growing restaurants and enterprise customers
            coming soon.
          </p>
          <p className="mt-2">
            Need a custom plan?{" "}
            <a
              href="mailto:sales@yourcompany.com"
              className="text-orange-500 hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>

      {/* Plan Change Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPlan && currentSubscription?.plan && (
                <>
                  Are you sure you want to change your subscription to the{" "}
                  <strong>{selectedPlan.name}</strong> plan?
                  {selectedPlan.price >
                  (currentSubscription.plan.price ?? 0) ? (
                    <span className="mt-2 block">
                      You will be charged the difference immediately and your
                      billing date will remain the same.
                    </span>
                  ) : selectedPlan.price <
                    (currentSubscription.plan.price ?? 0) ? (
                    <span className="mt-2 block">
                      Your subscription will be updated at the end of your
                      current billing period.
                    </span>
                  ) : null}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-full text-gray-700 hover:text-gray-800 border-gray-300"
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmPlanChange();
              }}
            >
              {isLoading ? (
                <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Processing..." : "Confirm Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
