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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiCheck, FiX, FiInfo } from "react-icons/fi";
import { useCurrency } from "@/lib/currency-context";
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
    currentSubscription?.plan?.interval === "yearly" ? "yearly" : "monthly"
  );

  // Filter plans by billing interval
  const filteredPlans = plans.filter(
    (plan) => plan.interval === billingInterval
  );

  // Sort plans by priority
  const sortedPlans = [...filteredPlans].sort(
    (a, b) => a.priority - b.priority
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
    <div id="plans" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your business needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Billing interval selector */}
            <div className="flex justify-center mb-8">
              <Tabs
                value={billingInterval}
                onValueChange={(value) =>
                  setBillingInterval(value as "monthly" | "yearly")
                }
                className="w-full max-w-md"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Yearly Billing
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
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

                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden ${
                      plan.isPopular ? "border-primary shadow-md" : ""
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                        Popular
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.price ?? 0)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{billingInterval}
                        </span>
                      </div>

                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={isCurrentPlan ? "outline" : "default"}
                        disabled={isCurrentPlan || isLoading}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {isCurrentPlan ? "Current Plan" : "Select Plan"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <div className="mt-2">
                      You will be charged the difference immediately and your
                      billing date will remain the same.
                    </div>
                  ) : selectedPlan.price <
                    (currentSubscription.plan.price ?? 0) ? (
                    <div className="mt-2">
                      Your plan will be downgraded immediately. You&apos;ll
                      receive a prorated credit for your current billing period.
                    </div>
                  ) : null}
                </>
              )}
              {(!selectedPlan || !currentSubscription?.plan) && (
                <div className="flex items-center gap-2">
                  <FiInfo className="text-blue-500" />
                  <span>Confirm to change your subscription plan.</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPlanChange}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Confirm Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
