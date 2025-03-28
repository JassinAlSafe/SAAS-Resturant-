"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EmailOtpType } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { createVerificationClient } from "@/lib/supabase/verification-client";

interface AuthCallbackHandlerProps {
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setError: (error: string | null) => void;
  setEmail: (email: string) => void;
  isLoading: boolean;
}

export function AuthCallbackHandler({
  setIsLoading,
  setIsSuccess,
  setError,
  setEmail,
  isLoading,
}: AuthCallbackHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createVerificationClient();

  // Memoized function to handle successful verification
  const handleSuccess = useCallback(
    (next: string) => {
      setIsSuccess(true);
      setIsLoading(false);

      toast({
        title: "Email Verified Successfully",
        description:
          "Your email has been verified. You'll now be redirected to the dashboard.",
        variant: "default",
      });

      // Redirect after a short delay
      setTimeout(() => router.push(next), 2000);
    },
    [setIsSuccess, setIsLoading, router, toast]
  );

  // Memoized function to handle verification errors
  const handleVerificationError = useCallback(
    (errorMsg: string, emailFromUrl?: string | null) => {
      console.error("Verification error:", errorMsg);
      setError(errorMsg);
      setIsLoading(false);

      // Set email from URL if available
      if (emailFromUrl) {
        setEmail(emailFromUrl);
      }
    },
    [setError, setIsLoading, setEmail]
  );

  useEffect(() => {
    // Only start the process if not already completed
    if (!isLoading) return;

    let isMounted = true;
    const controller = new AbortController();

    // Main verification function
    const verifyEmail = async () => {
      try {
        console.log("Starting email verification process");

        // Log URL parameters for debugging
        const params = Object.fromEntries(searchParams.entries());
        console.log("URL parameters:", params);
        console.log("URL hash:", window.location.hash);

        // Get URL parameters
        const errorDescription = searchParams.get("error_description");
        const errorCode = searchParams.get("error");
        const code = searchParams.get("code");
        const type = searchParams.get("type") as EmailOtpType | null;
        const next = searchParams.get("next") || "/dashboard";
        const emailFromUrl = searchParams.get("email");

        // Set email from URL if available
        if (emailFromUrl && isMounted) {
          setEmail(emailFromUrl);
        }

        // Check for error parameters first
        if (errorDescription || errorCode) {
          console.log("Error found in URL params:", {
            errorDescription,
            errorCode,
          });
          if (isMounted) {
            handleVerificationError(
              errorDescription || "Verification error",
              emailFromUrl
            );
          }
          return;
        }

        // Check for existing session
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session) {
          console.log("Using existing session");
          if (isMounted) handleSuccess(next);
          return;
        }

        // Handle OTP verification flow with code parameter
        if (code) {
          console.log("Verifying with code:", code);

          // Verify the email OTP
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: type || "signup",
          });

          if (error) {
            console.error("Error verifying email:", error);
            if (isMounted) {
              handleVerificationError(
                error.message || "Verification failed",
                emailFromUrl
              );
            }
            return;
          }

          if (data.session) {
            if (isMounted) handleSuccess(next);
          } else {
            if (isMounted) {
              handleVerificationError(
                "Verification was successful, but we couldn't establish a session. Please try logging in.",
                emailFromUrl
              );
            }
          }
          return;
        }

        // Handle hash fragment from URL
        if (window.location.hash) {
          try {
            const hashParams = new URLSearchParams(
              window.location.hash.substring(1)
            );
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");
            const type = hashParams.get("type");

            console.log("Found hash parameters:", {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
              type,
            });

            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                console.error("Error setting session from hash:", error);
                if (isMounted) {
                  handleVerificationError(
                    error.message || "Failed to set session",
                    emailFromUrl
                  );
                }
                return;
              }

              if (data.session) {
                if (isMounted) handleSuccess(next);
                return;
              }
            }
          } catch (hashError) {
            console.error("Error processing hash:", hashError);
          }
        }

        // If we reach here, no verification method succeeded
        if (isMounted) {
          handleVerificationError(
            "No verification code found. Please check your email for the verification link.",
            emailFromUrl
          );
        }
      } catch (error) {
        console.error("Unexpected error during verification:", error);
        if (isMounted) {
          handleVerificationError(
            "An unexpected error occurred. Please try again or contact support."
          );
        }
      }
    };

    verifyEmail();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    searchParams,
    handleSuccess,
    handleVerificationError,
    isLoading,
    setEmail,
    setIsLoading,
    setError,
    supabase,
  ]);

  return null;
}

export default AuthCallbackHandler;
