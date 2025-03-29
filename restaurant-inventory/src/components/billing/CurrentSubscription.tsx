import { useState } from "react";
import { Subscription } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiPause,
  FiPlay,
} from "react-icons/fi";
import { format, differenceInDays } from "date-fns";
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

interface CurrentSubscriptionProps {
  subscription: Subscription;
  onSubscriptionChange: (updatedSubscription: Subscription) => void;
}

export function CurrentSubscription({
  subscription,
  onSubscriptionChange,
}: CurrentSubscriptionProps) {
  const { formatCurrency } = useCurrency();
  const { success, error: showError } = useNotificationHelpers();
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);

  // Safety check - if subscription is null or undefined, show error
  if (!subscription) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Subscription data unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <FiAlertCircle className="text-amber-500 mr-2" />
            <p>Unable to load subscription details. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Make sure subscription.plan exists, return early if not
  if (!subscription.plan) {
    return (
      <Card className="border-none shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Plan details unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <FiAlertCircle className="text-amber-500 mr-2" />
            <p>Unable to load plan details. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate days remaining in the current period
  const daysRemaining = differenceInDays(
    new Date(subscription.currentPeriodEnd),
    new Date()
  );

  const totalDays = differenceInDays(
    new Date(subscription.currentPeriodEnd),
    new Date(subscription.currentPeriodStart)
  );

  const progressPercentage = Math.max(
    0,
    Math.min(100, 100 - (daysRemaining / totalDays) * 100)
  );

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await subscriptionService.cancelSubscription(subscription.userId);
      success(
        "Subscription Canceled",
        "Your subscription will be canceled at the end of the current billing period."
      );
      onSubscriptionChange(subscription);
    } catch (err) {
      console.error("Error canceling subscription:", err);
      showError(
        "Cancellation Failed",
        "There was a problem canceling your subscription. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsCancelDialogOpen(false);
    }
  };

  // Handle subscription resumption
  const handleResumeSubscription = async () => {
    setIsLoading(true);
    try {
      await subscriptionService.resumeSubscription(subscription.userId);
      success(
        "Subscription Resumed",
        "Your subscription will continue after the current billing period."
      );
      onSubscriptionChange(subscription);
    } catch (err) {
      console.error("Error resuming subscription:", err);
      showError(
        "Resume Failed",
        "There was a problem resuming your subscription. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription pause
  const handlePauseSubscription = async () => {
    setIsLoading(true);
    try {
      await subscriptionService.pauseSubscription(subscription.userId);
      success(
        "Subscription Paused",
        "Your subscription has been paused and will resume automatically in 30 days."
      );
      onSubscriptionChange(subscription);
    } catch (err) {
      console.error("Error pausing subscription:", err);
      showError(
        "Pause Failed",
        "There was a problem pausing your subscription. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsPauseDialogOpen(false);
    }
  };

  // Render subscription status badge
  const renderStatusBadge = () => {
    switch (subscription.status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-green-400 text-white">
            Active
          </Badge>
        );
      case "trialing":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-400 text-white">
            Trial
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-400 text-white">
            Canceled
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-400 text-white">
            Past Due
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-400 text-white">
            Paused
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-400 text-white">
            {subscription.status}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </div>
          {renderStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Plan details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{subscription.plan.name}</h3>
              <p className="text-muted-foreground">
                {subscription.plan.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(subscription.plan.price ?? 0)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{subscription.plan.interval}
                </span>
              </div>
            </div>
          </div>

          {/* Billing period */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <FiCalendar className="text-muted-foreground" />
                <span>Current period</span>
              </div>
              <div>
                {format(
                  new Date(subscription.currentPeriodStart),
                  "MMM d, yyyy"
                )}{" "}
                -{" "}
                {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <FiClock className="text-muted-foreground" />
                  <span>{daysRemaining} days remaining</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}% complete
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-2 bg-orange-50"
              />
            </div>
          </div>

          {/* Plan features */}
          <div className="space-y-2">
            <h4 className="font-medium">Plan Features</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <FiCheckCircle className="text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Renewal notice */}
          {subscription.status === "active" &&
            !subscription.cancelAtPeriodEnd && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-md text-sm">
                <FiAlertCircle className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  Your subscription will automatically renew on{" "}
                  <strong>
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMMM d, yyyy"
                    )}
                  </strong>
                  . You will be charged{" "}
                  {formatCurrency(subscription.plan.price ?? 0)}.
                </div>
              </div>
            )}

          {/* Cancellation notice */}
          {subscription.cancelAtPeriodEnd && (
            <div className="flex items-start gap-2 p-3 bg-orange-50/70 rounded-md text-sm">
              <FiAlertCircle className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                Your subscription is set to cancel on{" "}
                <strong>
                  {format(
                    new Date(subscription.currentPeriodEnd),
                    "MMMM d, yyyy"
                  )}
                </strong>
                . You will still have access until this date.
              </div>
            </div>
          )}

          {/* Paused subscription notice */}
          {subscription.status === "paused" && subscription.resumesAt && (
            <div className="flex items-start gap-2 p-3 bg-orange-50/50 rounded-md text-sm">
              <FiAlertCircle className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                Your subscription is paused. It will automatically resume on{" "}
                <strong>
                  {format(new Date(subscription.resumesAt), "MMMM d, yyyy")}
                </strong>
                .
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
            <Button
              variant="outline"
              asChild
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0 shadow-sm"
            >
              <a href="#plans">Change Plan</a>
            </Button>

            {subscription.status === "active" &&
              !subscription.cancelAtPeriodEnd && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsPauseDialogOpen(true)}
                    disabled={isLoading}
                    className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white border-0 shadow-sm"
                  >
                    <FiPause className="mr-2 h-4 w-4" />
                    Pause Subscription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCancelDialogOpen(true)}
                    disabled={isLoading}
                    className="rounded-full bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white border-0 shadow-sm"
                  >
                    Cancel Plan
                  </Button>
                </>
              )}

            {subscription.cancelAtPeriodEnd && (
              <Button
                variant="default"
                onClick={handleResumeSubscription}
                disabled={isLoading}
                className="rounded-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white border-0 shadow-sm"
              >
                <FiPlay className="mr-2 h-4 w-4" />
                Resume Subscription
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will still
              have access until the end of your current billing period on{" "}
              {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="rounded-full">
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white border-0 rounded-full shadow-sm"
            >
              {isLoading ? "Canceling..." : "Yes, Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pause Confirmation Dialog */}
      <AlertDialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to pause your subscription? Your
              subscription will be paused immediately and will automatically
              resume in 30 days. You won&apos;t be charged during the pause
              period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePauseSubscription}
              disabled={isLoading}
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white border-0 shadow-sm"
            >
              {isLoading ? "Pausing..." : "Yes, Pause Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
