"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

/**
 * A banner component that displays when users are logged in but haven't verified their email.
 * Provides options to resend verification email or dismiss the banner temporarily.
 */
export function EmailVerificationBanner() {
  const { user, isEmailVerified } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  // Check localStorage on mount to see if the banner was dismissed
  React.useEffect(() => {
    const dismissedInfo = localStorage.getItem(
      "email_verification_banner_dismissed"
    );
    if (dismissedInfo) {
      try {
        const { expiry } = JSON.parse(dismissedInfo);
        if (expiry > Date.now()) {
          setIsVisible(false);
        } else {
          // Clear expired dismissal
          localStorage.removeItem("email_verification_banner_dismissed");
        }
      } catch (error) {
        console.error("Error parsing banner dismissal info:", error);
        localStorage.removeItem("email_verification_banner_dismissed");
      }
    }
  }, []);

  // If user is verified or no user, don't show the banner
  if (isEmailVerified || !user) {
    return null;
  }

  // Don't show if user dismissed the banner
  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);

    // Store in localStorage that user has dismissed the banner
    // with a timestamp so we can show it again after a period
    const dismissalInfo = {
      timestamp: Date.now(),
      // Show again after 4 hours
      expiry: Date.now() + 4 * 60 * 60 * 1000,
    };
    localStorage.setItem(
      "email_verification_banner_dismissed",
      JSON.stringify(dismissalInfo)
    );
  };

  const handleResendVerification = async () => {
    if (!user.email) return;

    setIsResending(true);

    try {
      // Construct the redirect URL with the correct origin and parameters
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.append("email", user.email);

      // Send the verification email
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: redirectUrl.toString(),
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
      toast({
        title: "Failed to Send Verification Email",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-amber-50 border-b border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
        "px-4 py-3 text-amber-800 dark:text-amber-200 relative"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-start gap-2 max-w-3xl">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              Your email address hasn&apos;t been verified
            </p>
            <p className="text-sm mt-0.5">
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
            className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 dark:bg-amber-800/30 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800/50"
          >
            {isResending ? (
              <>Sending...</>
            ) : (
              <>
                <Mail className="mr-1 h-3 w-3" />
                Resend Email
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-800/40"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
