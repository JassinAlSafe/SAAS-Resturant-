"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  supabase,
  checkAuthStatus,
  handleAuthError,
  waitForAuthInit,
} from "@/lib/supabase";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { resetVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { checkBusinessProfileAccess } from "@/lib/services/business-profile-user-service";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { toast } = useToast();
  const { setIsEmailVerified } = useAuthStore();

  // Debug helper function
  const logDebug = (message: string, data?: unknown) => {
    console.log(`[AUTH CALLBACK] ${message}`, data || "");
  };

  useEffect(() => {
    logDebug(
      "Component mounted with search params:",
      Object.fromEntries(searchParams.entries())
    );

    const handleEmailConfirmation = async () => {
      try {
        setIsLoading(true);
        logDebug("Started email confirmation process");

        // First ensure auth is initialized to avoid race conditions
        const authInitialized = await waitForAuthInit();
        if (!authInitialized) {
          logDebug(
            "Warning: Auth system did not initialize within timeout window"
          );
        }

        // Get verification parameters from URL
        const code = searchParams.get("code");
        let emailToUse = searchParams.get("email");
        const type = searchParams.get("type") || "signup"; // Default to signup

        logDebug("URL parameters:", {
          code: code ? "present" : "missing",
          email: emailToUse,
          type,
        });

        // If no email in URL, try to get it from user data
        if (!emailToUse) {
          try {
            logDebug("No email in URL, trying to get from user data");

            // Use our improved auth check function
            const { authenticated, user } = await checkAuthStatus();

            if (!authenticated) {
              logDebug("User not authenticated");
            }

            if (user?.email) {
              emailToUse = user.email;
              logDebug("Retrieved email from user data:", emailToUse);
            } else {
              logDebug("No email found in user data");
            }
          } catch (userErr) {
            logDebug("Failed to get user data:", userErr);
          }
        }

        // Set email for potential resend
        if (emailToUse) {
          setEmail(emailToUse);
          logDebug("Set email for form:", emailToUse);
        }

        // Validate we have both code and email
        if (!code) {
          const errorMsg =
            "No verification code found. Please check your email for a valid verification link.";
          logDebug("Error: " + errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        if (!emailToUse) {
          const errorMsg =
            "Email address is required for verification. Please enter your email below.";
          logDebug("Error: " + errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        logDebug("Verifying OTP with:", { email: emailToUse, code, type });

        // Verify the OTP - note the parameter order matters for Supabase API
        // The token must be in the correct position in the parameter list
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          type: type === "signup" ? "signup" : "recovery",
          token: code,
          email: emailToUse,
        });

        logDebug("OTP verification response:", {
          success: !verifyError,
          error: verifyError ? verifyError.message : null,
          session: data?.session ? "present" : "missing",
          user: data?.user ? "present" : "missing",
        });

        if (verifyError) {
          let errorMsg = "";
          // Check for 403 status which indicates expired token
          if (
            verifyError.status === 403 ||
            verifyError.message?.includes("expired") ||
            verifyError.message?.includes("invalid")
          ) {
            errorMsg =
              "Your verification link has expired (valid for 1 hour). Please request a new one below.";
            // Reset banner visibility to ensure it's shown on the next page
            resetVerificationBanner();
          } else if (
            verifyError.message?.includes("rate limit") ||
            verifyError.message?.toLowerCase().includes("too many requests")
          ) {
            errorMsg =
              "You've made too many verification attempts. Please wait a few minutes and try again.";
          } else {
            errorMsg =
              verifyError.message ||
              "Failed to verify email. Please try again.";
          }

          logDebug("Verification error:", errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        if (!data?.session || !data?.user) {
          const errorMsg =
            "Failed to create session. Please try logging in again.";
          logDebug("Error: " + errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        // Update email verification status in auth store
        setIsEmailVerified(true);
        setIsSuccess(true);
        logDebug("Email verified successfully in store");

        // Update the user's profile to mark email as confirmed
        try {
          logDebug("Updating profile in database");

          // First check if profiles table exists and has the field we need
          const { data: tableInfo, error: tableError } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);

          if (tableError) {
            logDebug("Error checking profiles table:", tableError);
            // Try to recover from session error if present
            if (
              tableError.message?.includes("session") ||
              tableError.message?.includes("JWT")
            ) {
              await handleAuthError(tableError);
            }
          }

          if (tableInfo) {
            // Try to update profile's email_confirmed flag
            const { error: profileUpdateError } = await supabase
              .from("profiles")
              .update({ email_confirmed: true })
              .eq("id", data.user.id);

            if (profileUpdateError) {
              logDebug(
                "Could not update profile email_confirmed status:",
                profileUpdateError
              );
              // Try to recover from session error if present
              if (
                profileUpdateError.message?.includes("session") ||
                profileUpdateError.message?.includes("JWT")
              ) {
                await handleAuthError(profileUpdateError);

                // Try again after recovery
                const { error: retryError } = await supabase
                  .from("profiles")
                  .update({ email_confirmed: true })
                  .eq("id", data.user.id);

                if (retryError) {
                  logDebug("Retry also failed:", retryError);
                } else {
                  logDebug("Profile updated successfully after recovery");
                }
              }
            } else {
              logDebug("Profile updated successfully");
            }
          }

          // After email verification is complete, check if the user has a business profile
          logDebug("Checking for business profile access");
          const { hasAccess, profiles } = await checkBusinessProfileAccess(
            data.user.id
          );

          logDebug(
            `Business profile check result: hasAccess=${hasAccess}, profiles=${profiles.length}`
          );

          // Show success message
          toast({
            title: "Email Verified Successfully",
            description: hasAccess
              ? "Your email has been verified. Redirecting to your dashboard."
              : "Your email has been verified. Let's set up your restaurant profile now.",
          });
          logDebug("Success toast shown");

          // Make sure we clear any "verification needed" banner state
          resetVerificationBanner();

          // Refresh auth state to ensure it reflects email verification
          useAuthStore.getState().checkEmailVerification();

          // Redirect to appropriate page based on whether user has a business profile
          logDebug(
            `Setting timeout for redirect to ${
              hasAccess ? "dashboard" : "onboarding"
            }`
          );
          setTimeout(() => {
            logDebug(
              `Redirecting to ${hasAccess ? "dashboard" : "onboarding"}`
            );
            router.push(hasAccess ? "/dashboard" : "/onboarding");
          }, 2000);
        } catch (err) {
          logDebug("Error updating profile or checking business profile:", err);
          // Try to recover if it's an auth error
          if (
            err instanceof Error &&
            (err.message.includes("session") || err.message.includes("JWT"))
          ) {
            await handleAuthError(err);
          }

          // Default to onboarding path in case of error
          setTimeout(() => {
            logDebug("Redirecting to onboarding (default path after error)");
            router.push("/onboarding");
          }, 2000);
        }
      } catch (err) {
        logDebug("Unexpected error during verification:", err);
        setError(
          "An unexpected error occurred. Please try again or contact support."
        );
      } finally {
        setIsLoading(false);
        logDebug("Verification process completed");
      }
    };

    // Immediately run the verification when component mounts
    handleEmailConfirmation();
  }, [searchParams, router, toast, setIsEmailVerified]);

  const handleResendConfirmation = async () => {
    if (!email || email.trim() === "") {
      toast({
        title: "Email Required",
        description:
          "Please enter your email address to resend the confirmation.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResending(true);
      logDebug("Starting resend process for email:", email);

      // Create redirect URL with all necessary parameters for PKCE flow
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.append("type", "signup");

      // Add a random state parameter to prevent CSRF attacks
      const state = Math.random().toString(36).substring(2);
      redirectUrl.searchParams.append("state", state);

      // Add email to URL to ensure consistent parameter pass-through
      redirectUrl.searchParams.append("email", email.trim());

      logDebug("Resend redirect URL:", redirectUrl.toString());

      // Attempt to resend verification with proper PKCE flow
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl.toString(),
          captchaToken: undefined, // Only provide if you're using hCaptcha or reCAPTCHA
        },
      });

      if (error) {
        logDebug("Error resending verification:", error);

        // Specific error handling for common issues
        if (
          error.message.toLowerCase().includes("rate limit") ||
          error.message.toLowerCase().includes("too many requests")
        ) {
          toast({
            title: "Rate Limit Reached",
            description:
              "You've requested too many emails recently. Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else if (error.message.toLowerCase().includes("already confirmed")) {
          toast({
            title: "Email Already Verified",
            description:
              "Your email has already been verified. Please sign in to continue.",
            variant: "default",
          });
          // Redirect to sign in after a short delay
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        } else {
          throw error;
        }
        return;
      }

      logDebug("Verification email sent successfully");
      setResendSuccess(true);
      toast({
        title: "Verification Email Sent",
        description:
          "Please check your inbox for the new verification link. The link will expire in 1 hour.",
      });
    } catch (error) {
      logDebug("Error resending verification:", error);
      toast({
        title: "Failed to Send",
        description:
          error instanceof Error
            ? error.message
            : "Could not send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Verifying your email...
              </p>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-xl font-semibold">Email Verified!</h3>
              <p className="mt-1 text-sm text-center text-slate-600 dark:text-slate-400">
                Redirecting you to set up your restaurant profile...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-xl font-semibold text-red-600">
                  Verification Failed
                </h3>
                <p className="mt-1 text-sm text-center text-slate-600 dark:text-slate-400">
                  {error}
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isResending}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleResendConfirmation}
                  disabled={isResending || resendSuccess}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Email Sent
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
