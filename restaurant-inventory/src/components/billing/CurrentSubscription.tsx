import { useState, useEffect } from "react";
import { Subscription, SubscriptionPlan } from "@/lib/types";
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

interface CurrentSubscriptionProps {
  subscription: Subscription;
  onSubscriptionChange: () => void;
}

export function CurrentSubscription({
  subscription,
  onSubscriptionChange,
}: CurrentSubscriptionProps) {
  const { formatCurrency } = useCurrency();
  const { success, error } = useNotificationHelpers();
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);

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
      onSubscriptionChange();
    } catch (err) {
      console.error("Error canceling subscription:", err);
      error(
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
      onSubscriptionChange();
    } catch (err) {
      console.error("Error resuming subscription:", err);
      error(
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
      onSubscriptionChange();
    } catch (err) {
      console.error("Error pausing subscription:", err);
      error(
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
        return <Badge className="bg-green-500">Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500">Trial</Badge>;
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      default:
        return <Badge>{subscription.status}</Badge>;
    }
  };

  return (
    <Card>
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
                {formatCurrency(subscription.plan.price)}
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
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Plan features */}
          <div className="space-y-2">
            <h4 className="font-medium">Plan Features</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <FiCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Renewal notice */}
          {subscription.status === "active" &&
            !subscription.cancelAtPeriodEnd && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md text-sm">
                <FiAlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  Your subscription will automatically renew on{" "}
                  <strong>
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMMM d, yyyy"
                    )}
                  </strong>
                  . You will be charged{" "}
                  {formatCurrency(subscription.plan.price)}.
                </div>
              </div>
            )}

          {/* Cancellation notice */}
          {subscription.cancelAtPeriodEnd && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md text-sm">
              <FiAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" />
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
            <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-md text-sm">
              <FiAlertCircle className="text-purple-500 flex-shrink-0 mt-0.5" />
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
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" asChild>
              <a href="#plans">Change Plan</a>
            </Button>

            {subscription.status === "active" &&
              !subscription.cancelAtPeriodEnd && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsPauseDialogOpen(true)}
                    disabled={isLoading}
                  >
                    <FiPause className="mr-2 h-4 w-4" />
                    Pause Subscription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCancelDialogOpen(true)}
                    disabled={isLoading}
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
            <AlertDialogCancel disabled={isLoading}>
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
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
              resume in 30 days. You won't be charged during the pause period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePauseSubscription}
              disabled={isLoading}
            >
              {isLoading ? "Pausing..." : "Yes, Pause Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
