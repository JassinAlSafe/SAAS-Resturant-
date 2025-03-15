"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
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

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setIsLoading(true);

        // Check for error in URL query parameters
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Also check for error in URL hash fragment (some auth providers use this)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const hashError = hashParams.get("error");
        const hashErrorDescription = hashParams.get("error_description");

        // Combine errors from both sources
        const finalError = errorParam || hashError;
        const finalErrorDescription = errorDescription || hashErrorDescription;

        if (finalError) {
          console.error(
            "Auth callback error:",
            finalError,
            finalErrorDescription
          );

          // Handle expired link specifically
          if (
            finalError === "access_denied" ||
            (finalErrorDescription && finalErrorDescription.includes("expired"))
          ) {
            setError(
              "Your email verification link has expired or is invalid. Please request a new one."
            );
          } else {
            setError(
              finalErrorDescription ||
                "An error occurred during verification. Please try again."
            );
          }

          setIsLoading(false);
          return;
        }

        // Extract code from URL
        const code = searchParams.get("code");

        if (!code) {
          console.error("No code found in URL");
          setError(
            "No verification code found. Please check your email link or request a new one."
          );
          setIsLoading(false);
          return;
        }

        // Exchange code for session
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Error exchanging code for session:", exchangeError);
          setError(
            exchangeError.message ||
              "Failed to verify your email. Please try again."
          );
          setIsLoading(false);
          return;
        }

        // Success!
        setIsSuccess(true);
        setIsLoading(false);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setError(
          "An unexpected error occurred. Please try again or contact support."
        );
        setIsLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router]);

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

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        console.error("Error resending confirmation:", error);
        toast({
          title: "Failed to Resend",
          description:
            error.message ||
            "Could not resend confirmation email. Please try again.",
          variant: "destructive",
        });
        setIsResending(false);
        return;
      }

      setResendSuccess(true);
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your inbox for the new verification link.",
      });
    } catch (err) {
      console.error("Unexpected error resending confirmation:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Email Verification
        </h1>

        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-gray-600">Verifying your email...</p>
          </div>
        )}

        {isSuccess && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-center text-gray-600">
              Your email has been verified successfully! Redirecting you to the
              dashboard...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-red-600">{error}</p>
            </div>

            <div className="w-full space-y-4 pt-4">
              <p className="text-center text-sm text-gray-600">
                Enter your email to receive a new verification link:
              </p>

              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={isResending || resendSuccess}
              />

              <Button
                onClick={handleResendConfirmation}
                className="w-full"
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

              {resendSuccess && (
                <p className="text-center text-sm text-green-600">
                  A new verification link has been sent to your email.
                </p>
              )}

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="text-sm text-gray-600"
                >
                  Return to Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
