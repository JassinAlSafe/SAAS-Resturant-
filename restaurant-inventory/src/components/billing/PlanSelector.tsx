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
import { FiCheck, FiInfo } from "react-icons/fi";
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

  // Filter plans by billing interval
  const filteredPlans = plans.filter((plan) => {
    // Update the interval check to be more robust
    if (billingInterval === "monthly") {
      return plan.interval === "month" || !plan.interval;
    } else {
      return plan.interval === "year";
    }
  });

  // If no filtered plans, use all plans and update their interval and price
  const plansToDisplay =
    filteredPlans.length > 0
      ? filteredPlans
      : plans.map((plan) => ({
          ...plan,
          interval: billingInterval === "monthly" ? "month" : "year",
          price:
            billingInterval === "monthly"
              ? plan.monthlyPrice
              : plan.yearlyPrice,
        }));

  // Sort plans by priority
  const sortedPlans = [...plansToDisplay].sort(
    (a, b) => (a.priority || 0) - (b.priority || 0)
  );

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

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id;
          // Determine the correct price based on billing interval
          const displayPrice =
            billingInterval === "monthly"
              ? plan.monthlyPrice || plan.price
              : plan.yearlyPrice || plan.price;

          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col overflow-hidden border-none shadow-sm rounded-xl",
                plan.isPopular
                  ? "border-primary shadow-md ring-1 ring-orange-200"
                  : ""
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-3 py-1 text-xs font-medium rounded-bl-xl">
                  Popular
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 flex-grow">
                <div className="text-3xl font-bold text-center">
                  {formatCurrency(displayPrice ?? 0)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{billingInterval === "monthly" ? "month" : "year"}
                  </span>
                </div>

                <ul className="space-y-2 mx-auto max-w-[260px]">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-6 pt-2 pb-6 mt-auto">
                <Button
                  className={cn(
                    "w-full rounded-full py-6 text-white border-0 shadow-sm",
                    isCurrentPlan
                      ? "bg-gradient-to-r from-gray-400 to-gray-300 hover:from-gray-500 hover:to-gray-400"
                      : "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
                  )}
                  variant="default"
                  disabled={isCurrentPlan || isLoading}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan ? "Current Plan" : "Select Plan"}
                </Button>
              </div>
            </Card>
          );
        })}
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
                      Your plan will be downgraded immediately. You&apos;ll
                      receive a prorated credit for your current billing period.
                    </span>
                  ) : null}
                </>
              )}
              {(!selectedPlan || !currentSubscription?.plan) && (
                <span className="flex items-center gap-2">
                  <FiInfo className="text-blue-500" />
                  <span>Confirm to change your subscription plan.</span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPlanChange}
              disabled={isLoading}
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0"
            >
              {isLoading ? "Updating..." : "Confirm Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
