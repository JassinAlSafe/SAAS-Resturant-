"use client";

import React, { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { useNotification } from "../../lib/notification-context";
import { 
  cancelSubscription, 
  getSubscription, 
  getPaymentMethods,
  Subscription,
  PaymentMethod
} from "../../lib/services/dashboard/billing-service";

// Function to handle subscription cancellation
export async function handleCancelSubscription(
  subscriptionId: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addNotification: (notification: { type: string; message: string }) => void,
  onSuccess?: () => void
) {
  if (!subscriptionId) return;

  setIsLoading(true);
  try {
    const success = await cancelSubscription(subscriptionId);
    
    if (success) {
      addNotification({
        type: "success",
        message: "Your subscription has been cancelled and will end at the current billing period.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
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
    setIsLoading(false);
  }
}

// Function to fetch subscription data
export async function fetchSubscriptionData(
  businessProfileId: string,
  setSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addNotification: (notification: { type: string; message: string }) => void
) {
  if (!businessProfileId) return;

  setIsLoading(true);
  try {
    const subscriptionData = await getSubscription(businessProfileId);
    setSubscription(subscriptionData);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    addNotification({
      type: "error",
      message: "Failed to load subscription information. Please try again later.",
    });
  } finally {
    setIsLoading(false);
  }
}

// Function to fetch payment methods
export async function fetchPaymentMethods(
  businessProfileId: string,
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addNotification: (notification: { type: string; message: string }) => void
) {
  if (!businessProfileId) return;

  setIsLoading(true);
  try {
    const paymentMethodsData = await getPaymentMethods(businessProfileId);
    setPaymentMethods(paymentMethodsData);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    addNotification({
      type: "error",
      message: "Failed to load payment methods. Please try again later.",
    });
  } finally {
    setIsLoading(false);
  }
}

// Format date from timestamp
export function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString();
}

// BillingService component - used as a wrapper for billing-related functionality
export const BillingService = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  // We\'re not going to clone elements with props since it\'s causing type issues
  // Instead, we\'ll provide a context if needed or just render the children directly
  return <>{children}</>;
};

// Also export as default for backward compatibility
export default BillingService;
