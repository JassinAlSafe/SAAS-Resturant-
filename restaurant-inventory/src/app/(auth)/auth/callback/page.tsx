"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

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
  const { setIsEmailVerified } = useAuth();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setIsLoading(true);

        // Get verification parameters from URL
        const code = searchParams.get("code");
        let emailToUse = searchParams.get("email");

        console.log("Verification parameters:", {
          code: code ? "present" : "missing",
          email: emailToUse || "missing",
        });

        // If no email in URL, try to get it from session
        if (!emailToUse) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user?.email) {
            emailToUse = data.session.user.email;
          }
        }

        // Set email for potential resend
        if (emailToUse) {
          setEmail(emailToUse);
        }

        // Validate we have both code and email
        if (!code) {
          setError(
            "No verification code found. Please check your email for a valid verification link."
          );
          setIsLoading(false);
          return;
        }

        if (!emailToUse) {
          setError(
            "Email address is required for verification. Please enter your email below."
          );
          setIsLoading(false);
          return;
        }

        // Verify the OTP
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          type: "signup",
          token: code,
          email: emailToUse,
        });

        if (verifyError) {
          if (verifyError.message?.includes("expired")) {
            setError(
              "Your verification link has expired (valid for 1 hour). Please request a new one below."
            );
          } else if (verifyError.message?.includes("invalid")) {
            setError(
              "Invalid verification link. Please request a new one below."
            );
          } else {
            setError(
              verifyError.message || "Failed to verify email. Please try again."
            );
          }
          setIsLoading(false);
          return;
        }

        if (!data.session || !data.user) {
          setError("Failed to create session. Please try logging in again.");
          setIsLoading(false);
          return;
        }

        // Update email verification status
        setIsEmailVerified(true);
        setIsSuccess(true);

        // Show success message
        toast({
          title: "Email Verified Successfully",
          description:
            "Your email has been verified. Let's set up your restaurant profile.",
        });

        // Redirect to onboarding after a short delay
        setTimeout(() => {
          router.push("/onboarding");
        }, 2000);
      } catch (err) {
        console.error("Unexpected error during verification:", err);
        setError(
          "An unexpected error occurred. Please try again or contact support."
        );
      } finally {
        setIsLoading(false);
      }
    };

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

      // Create redirect URL with all necessary parameters
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.append("type", "signup");
      redirectUrl.searchParams.append("email", email.trim());

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl.toString(),
        },
      });

      if (error) throw error;

      setResendSuccess(true);
      toast({
        title: "Verification Email Sent",
        description:
          "Please check your inbox for the new verification link. The link will expire in 1 hour.",
      });
    } catch (error) {
      console.error("Error resending verification:", error);
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
