"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Create a store to manage banner visibility across components
interface BannerState {
  isDismissed: boolean;
  dismissalTimestamp: number | null;
  dismissBanner: () => void;
  resetBanner: () => void;
}

export const useBannerStore = create<BannerState>()(
  persist(
    (set) => ({
      isDismissed: false,
      dismissalTimestamp: null,
      dismissBanner: () =>
        set({
          isDismissed: true,
          dismissalTimestamp: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
        }),
      resetBanner: () =>
        set({
          isDismissed: false,
          dismissalTimestamp: null,
        }),
    }),
    {
      name: "email-verification-banner",
    }
  )
);

/**
 * A banner component that displays when users are logged in but haven't verified their email.
 * Provides options to resend verification email or dismiss the banner temporarily.
 */
export function EmailVerificationBanner() {
  const { user, isEmailVerified } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const { isDismissed, dismissalTimestamp, dismissBanner, resetBanner } =
    useBannerStore();
  const [isVisible, setIsVisible] = useState(false);

  // Effect to check if verification banner should be shown based on state
  useEffect(() => {
    // If user is verified or there's no user, don't show the banner
    if (isEmailVerified || !user) {
      return;
    }

    // Check if the banner was dismissed and if the dismissal period has expired
    if (isDismissed && dismissalTimestamp) {
      if (Date.now() < dismissalTimestamp) {
        setIsVisible(false);
      } else {
        // Reset banner if dismissal period has expired
        resetBanner();
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, [isEmailVerified, user, isDismissed, dismissalTimestamp, resetBanner]);

  // If user is verified or no user, don't show the banner
  if (isEmailVerified || !user) {
    return null;
  }

  // Don't show if user dismissed the banner
  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    dismissBanner();
    setIsVisible(false);
  };

  const handleResendVerification = async () => {
    if (!user.email) return;

    setIsResending(true);

    try {
      // Construct the redirect URL with the correct origin and parameters
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.append("type", "signup");
      redirectUrl.searchParams.append("email", user.email);

      // Add a random state parameter to prevent CSRF attacks
      const state = Math.random().toString(36).substring(2);
      redirectUrl.searchParams.append("state", state);

      console.log(
        "Sending verification email with redirect:",
        redirectUrl.toString()
      );

      // Send the verification email with PKCE flow
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: redirectUrl.toString(),
          captchaToken: undefined, // Only if using hCaptcha/reCAPTCHA
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification Email Sent",
        description:
          "Please check your inbox (and spam folder) for the verification link. The link will expire in 1 hour.",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);

      // Provide more specific error messages for common errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (
          errorMessage.includes("rate limit") ||
          errorMessage.includes("too many requests")
        ) {
          toast({
            title: "Email Sending Limited",
            description:
              "You've requested too many emails recently. Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else if (errorMessage.includes("already confirmed")) {
          toast({
            title: "Email Already Verified",
            description:
              "Your email has already been verified. Please refresh the page.",
            variant: "default",
          });
          // Force refresh verification status
          window.location.reload();
        } else {
          toast({
            title: "Failed to Send Verification Email",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Failed to Send Verification Email",
          description: "An unknown error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "w-full bg-amber-50 border-b border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
        "px-4 py-3 text-amber-800 dark:text-amber-200 relative"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-start gap-2 max-w-3xl">
          <AlertTriangle
            className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium" id="verification-banner-title">
              Your email address hasn&apos;t been verified
            </p>
            <p className="text-sm mt-0.5" id="verification-banner-description">
              Some features will be limited until you verify your email address.
              Please check your inbox for a verification link.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            aria-label="Resend verification email"
            className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 dark:bg-amber-800/30 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800/50"
          >
            {isResending ? (
              <>Sending...</>
            ) : (
              <>
                <Mail className="mr-1 h-3 w-3" aria-hidden="true" />
                Resend Email
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="h-8 w-8 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-800/40"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add function to force reset banner visibility for external components
export function resetVerificationBanner() {
  const { resetBanner } = useBannerStore.getState();
  resetBanner();
}
