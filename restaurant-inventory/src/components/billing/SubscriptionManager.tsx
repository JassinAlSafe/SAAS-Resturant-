"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { useNotification } from "../../lib/notification-context";
import { 
  getSubscription, 
  getPaymentMethods,
  cancelSubscription,
  Subscription,
  PaymentMethod
} from "../../lib/services/dashboard/billing-service";
import { useCurrency } from "../../lib/currency";

// Subscription Manager Component
export default function SubscriptionManager() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { formatCurrency } = useCurrency();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch subscription and payment methods
  useEffect(() => {
    async function fetchBillingData() {
      if (!user?.businessProfileId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch subscription data
        const subscriptionData = await getSubscription(user.businessProfileId);
        setSubscription(subscriptionData);

        // Fetch payment methods
        const paymentMethodsData = await getPaymentMethods(user.businessProfileId);
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        addNotification({
          type: "error",
          message: "Failed to load billing information. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBillingData();
  }, [user?.businessProfileId, addNotification]);

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;

    setIsCancelling(true);
    try {
      const success = await cancelSubscription(subscription.id);
      
      if (success) {
        // Update local subscription state to reflect cancellation
        setSubscription(prev => 
          prev ? { ...prev, cancel_at_period_end: true } : null
        );
        
        addNotification({
          type: "success",
          message: "Your subscription has been cancelled and will end at the current billing period.",
        });
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      addNotification({
        type: "error",
        message: "Failed to cancel subscription. Please try again later.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4 mt-4"></div>
        </div>
      </div>
    );
  }

  // Render no subscription state
  if (!subscription) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">No Active Subscription</h2>
        <p className="text-gray-600 mb-4">
          You don\'t have an active subscription. Choose a plan to get started.
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => window.location.href = "/billing/plans"}
        >
          View Plans
        </button>
      </div>
    );
  }

  // Render active subscription
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
      
      {/* Subscription details */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Plan</p>
            <p className="font-medium">{subscription.plan?.name || "Unknown Plan"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium">
              {subscription.plan 
                ? `${formatCurrency(subscription.plan.amount / 100)} / ${subscription.plan.interval}`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                subscription.status === "active" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Period Ends</p>
            <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
          </div>
        </div>
      </div>
      
      {/* Payment method summary */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Payment Method</h3>
        {paymentMethods.length > 0 ? (
          <div className="flex items-center">
            {paymentMethods[0].card && (
              <>
                <div className="mr-3">
                  <span className="text-2xl">
                    {paymentMethods[0].card.brand === "visa" ? "Visa" : 
                     paymentMethods[0].card.brand === "mastercard" ? "Mastercard" : 
                     paymentMethods[0].card.brand === "amex" ? "Amex" : 
                     paymentMethods[0].card.brand}
                  </span>
                </div>
                <div>
                  <p className="font-medium">   {paymentMethods[0].card.last4}</p>
                  <p className="text-sm text-gray-500">
                    Expires {paymentMethods[0].card.exp_month}/{paymentMethods[0].card.exp_year}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No payment method on file</p>
        )}
      </div>
      
      {/* Subscription actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Update payment method button */}
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          onClick={() => window.location.href = "/billing/payment-methods"}
        >
          Update Payment Method
        </button>
        
        {/* Cancel subscription button */}
        {!subscription.cancel_at_period_end && (
          <button
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
            onClick={handleCancelSubscription}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel Subscription"}
          </button>
        )}
        
        {/* Subscription already cancelled notice */}
        {subscription.cancel_at_period_end && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
            <p>
              Your subscription has been cancelled and will end on {formatDate(subscription.current_period_end)}.
            </p>
            <button
              className="mt-2 text-blue-600 hover:underline"
              onClick={() => window.location.href = "/billing/plans"}
            >
              Renew Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
