"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Component to handle URL params
function CallbackHandler({ 
  setError, 
  setIsLoading, 
  setIsSuccess, 
  setEmail, 
  setIsResending, 
  setResendSuccess, 
  router, 
  toast 
}: { 
  setError: (value: string | null) => void;
  setIsLoading: (value: boolean) => void;
  setIsSuccess: (value: boolean) => void;
  setEmail: (value: string) => void;
  setIsResending: (value: boolean) => void;
  setResendSuccess: (value: boolean) => void;
  router: any;
  toast: any;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (true) {
        console.log("Email verification timeout after 15 seconds");
        setIsLoading(false);
        setError("Verification is taking longer than expected. Please try logging in directly or contact support.");
      }
    }, 15000); // 15 seconds timeout

    const handleEmailConfirmation = async () => {
      try {
        setIsLoading(true);
        console.log("Starting email verification process");
        console.log("URL parameters:", Object.fromEntries(searchParams.entries()));
        console.log("URL hash:", window.location.hash);

        // Check for error in URL query parameters
        const errorParam = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");

        // Also check for error in URL hash fragment (some auth providers use this)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const hashError = hashParams.get("error");
        const hashErrorCode = hashParams.get("error_code");
        const hashErrorDescription = hashParams.get("error_description");

        // Combine errors from both sources
        const finalError = errorParam || hashError;
        const finalErrorCode = errorCode || hashErrorCode;
        const finalErrorDescription = errorDescription || hashErrorDescription;

        if (finalError) {
          console.error(
            "Auth callback error:",
            finalError,
            finalErrorCode,
            finalErrorDescription
          );

          // Handle specific error cases
          if (
            finalErrorCode === "invalid_request" &&
            finalErrorDescription?.includes("code verifier")
          ) {
            // Try to recover the session first
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              console.log("Recovered existing session");
              setIsSuccess(true);
              toast({
                title: "Already Verified",
                description:
                  "Your email was already verified. Proceeding to dashboard.",
              });
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
              return;
            }

            setError(
              "Authentication error: Session expired or invalid. Please try logging in again."
            );
            setTimeout(() => router.push("/login"), 2000);
            return;
          }

          if (
            finalErrorCode === "otp_expired" ||
            finalError === "access_denied" ||
            (finalErrorDescription && finalErrorDescription.includes("expired"))
          ) {
            setError(
              "Your email verification link has expired (they\'re valid for 1 hour). Please enter your email below to request a new one."
            );
            // Pre-fill the email field if available from the URL
            const emailFromUrl = searchParams.get("email");
            if (emailFromUrl) {
              setEmail(decodeURIComponent(emailFromUrl));
            }
          } else {
            setError(
              finalErrorDescription ||
                "An error occurred during verification. Please try again."
            );
          }

          setIsLoading(false);
          return;
        }

        // Extract parameters using Supabase\'s newer auth flow (with code parameter)
        const code = searchParams.get("code");
        const type = searchParams.get("type") as EmailOtpType | null;
        const next = searchParams.get("next") || "/dashboard"; // Default to dashboard instead of onboarding

        console.log("Auth parameters:", { code, type });

        if (!code) {
          console.error("No auth code found in URL");
          setError(
            "Invalid verification link. Please check your email for a valid link or request a new one."
          );
          setIsLoading(false);
          return;
        }

        // First try to get an existing session
        const { data: existingSession } = await supabase.auth.getSession();
        console.log("Existing session check:", existingSession?.session ? "Found" : "Not found");
        if (existingSession?.session) {
          console.log("Using existing session");
          setIsSuccess(true);
          toast({
            title: "Already Verified",
            description:
              "Your email was already verified. Proceeding to dashboard.",
          });
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
          return;
        }

        console.log("Attempting to exchange code for session");

        try {
          console.log("Exchanging code for session...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );

          if (error) {
            console.error("Error exchanging code:", error);

            // If we get a code verifier error, try to recover the session one more time
            if (error.message?.includes("code verifier")) {
              const { data: recoveredSession } =
                await supabase.auth.getSession();
              if (recoveredSession?.session) {
                console.log("Recovered session after code verifier error");
                setIsSuccess(true);
                toast({
                  title: "Verification Successful",
                  description:
                    "Your email has been verified. Proceeding to dashboard.",
                });
                setTimeout(() => {
                  router.push("/dashboard");
                }, 2000);
                return;
              }
            }

            // Provide a more descriptive error message for common issues
            let errorMessage = error.message || "Failed to verify your email.";

            if (error.message?.includes("expired")) {
              errorMessage =
                "Your verification link has expired. Please request a new one.";
            } else if (error.message?.includes("invalid")) {
              errorMessage =
                "Your verification link is invalid. Please request a new one.";
            }

            setError(errorMessage);
            setIsLoading(false);
            return;
          }

          console.log("Authentication success:", {
            hasSession: !!data?.session,
            hasUser: !!data?.user,
            userId: data?.user?.id,
          });

          // Check if we have a valid session
          if (data?.session) {
            setIsSuccess(true);

            // Show success toast
            toast({
              title: "Email Verified Successfully",
              description:
                "Your email has been verified. You\'ll now be redirected to the dashboard.",
              variant: "default",
            });

            // If this is a signup confirmation, update the user\'s profile
            if (type === "signup" || !type) {
              try {
                if (data.user) {
                  console.log("Updating profile for user:", data.user.id);
                  
                  // First check if a profile exists
                  const { data: profileData, error: profileCheckError } =
                    await supabase
                      .from("profiles")
                      .select("*")
                      .eq("id", data.user.id)
                      .maybeSingle();

                  if (profileCheckError) {
                    console.error("Error checking profile:", profileCheckError);
                  }

                  console.log("Existing profile data:", profileData);

                  // Create or update the profile
                  const profileUpdateData = {
                    id: data.user.id,
                    email: data.user.email,
                    email_confirmed: true,
                    role: "owner",
                    // If we have existing profile data, use the name from there, otherwise try to get it from user metadata
                    name:
                      profileData?.name ||
                      data.user.user_metadata?.name ||
                      "User",
                  };

                  console.log("Updating profile with data:", profileUpdateData);

                  const { error: upsertError } = await supabase
                    .from("profiles")
                    .upsert(profileUpdateData, {
                      onConflict: "id",
                      ignoreDuplicates: false, // This will update the record if it exists
                    });

                  if (upsertError) {
                    console.error("Error updating profile:", upsertError);
                    // Continue anyway - don\'t block the flow if profile update fails
                    console.log("Continuing despite profile update error");
                  } else {
                    console.log("Profile updated successfully");
                  }

                  // Check if a business profile exists for this user
                  const { data: businessData, error: businessError } =
                    await supabase
                      .from("business_profile_users")
                      .select("business_profile_id")
                      .eq("user_id", data.user.id)
                      .maybeSingle();

                  if (businessError) {
                    console.error(
                      "Error checking business profile:",
                      businessError
                    );
                    // Continue anyway - don\'t block the flow
                  } else if (!businessData) {
                    console.log("No business profile found, creating one");
                    
                    try {
                      // First create a business profile
                      const { data: newBusinessProfile, error: createBusinessError } = await supabase
                        .from("business_profiles")
                        .insert({
                          user_id: data.user.id, // Set the user_id field
                          name: "My Restaurant", // Default name that will be updated during onboarding
                          default_currency: "USD", // Default currency that will be updated during onboarding
                          type: "restaurant", // Default type
                          subscription_plan: "free", // Default plan
                          subscription_status: "active", // Default status
                          max_users: 1, // Default max users
                          tax_enabled: false, // Default tax setting
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        })
                        .select()
                        .single();

                      if (createBusinessError) {
                        console.error(
                          "Error creating business profile:",
                          createBusinessError
                        );
                        // Continue anyway - don\'t block the flow
                      } else if (newBusinessProfile) {
                        console.log(
                          "Successfully created business profile:",
                          newBusinessProfile.id
                        );
                        
                        // Now associate the user with the business profile
                        const { error: associationError } = await supabase
                          .from("business_profile_users")
                          .insert({
                            user_id: data.user.id,
                            business_profile_id: newBusinessProfile.id,
                            role: "owner",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          });
                          
                        if (associationError) {
                          console.error(
                            "Error associating user with business profile:",
                            associationError
                          );
                          
                          // If we fail to create the association, try a direct approach
                          console.log("Attempting alternative association method");
                          
                          // Try a simpler insert without additional fields
                          const { error: simpleAssociationError } = await supabase
                            .from("business_profile_users")
                            .insert({
                              user_id: data.user.id,
                              business_profile_id: newBusinessProfile.id,
                              role: "owner"
                            });
                            
                          if (simpleAssociationError) {
                            console.error(
                              "Error with simple association method:",
                              simpleAssociationError
                            );
                          } else {
                            console.log("Successfully associated user with business profile using simple method");
                          }
                        } else {
                          console.log("Successfully associated user with business profile");
                        }
                      }
                    } catch (businessCreationError) {
                      console.error("Error in business profile creation flow:", businessCreationError);
                      // Don\'t block the verification process, continue to dashboard
                    }
                  } else {
                    console.log(
                      "Business profile association already exists:",
                      businessData.business_profile_id
                    );
                  }
                }
              } catch (updateError) {
                console.error(
                  "Error updating user profile or business profile:",
                  updateError
                );
              }
            }

            // Redirect to the dashboard page after a short delay
            setTimeout(() => {
              router.push(next);
            }, 2000);
          } else {
            console.error("No session created after code exchange");
            setError(
              "Failed to create a session. Please try logging in manually."
            );
            // Redirect to login after a short delay
            setTimeout(() => {
              router.push("/login");
            }, 3000);
          }

          setIsLoading(false);
        } catch (err) {
          console.error("Error in code exchange:", err);
          setError(
            "An error occurred during verification. Please try again or contact support."
          );
          setIsLoading(false);
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setError(
          "An unexpected error occurred. Please try again or contact support."
        );
        setIsLoading(false);
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleEmailConfirmation();

    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, [searchParams, setError, setIsLoading, setIsSuccess, setEmail, setIsResending, setResendSuccess, router, toast]);

  return null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { toast } = useToast();

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

      // Create a redirect URL with the type parameter
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.append("type", "signup");
      redirectUrl.searchParams.append("email", email.trim());

      console.log("Resending with redirect URL:", redirectUrl.toString());

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl.toString(),
        },
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
        description:
          "Please check your inbox for the new verification link. The link will expire in 1 hour.",
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
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Email Verification
        </h1>

        <Suspense fallback={null}>
          <CallbackHandler 
            setError={setError} 
            setIsLoading={setIsLoading} 
            setIsSuccess={setIsSuccess} 
            setEmail={setEmail} 
            setIsResending={setIsResending} 
            setResendSuccess={setResendSuccess} 
            router={router} 
            toast={toast} 
          />
        </Suspense>

        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-gray-600 dark:text-gray-300">
              Verifying your email...
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-center text-gray-600 dark:text-gray-300">
              Your email has been verified successfully!
            </p>
            <div className="mt-4 flex flex-col space-y-3 w-full">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center justify-center"
              >
                Complete Your Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Skip to Dashboard
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>

            <div className="w-full space-y-4 pt-4">
              <div className="space-y-2 px-4 text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  If you\'re having trouble with automatic verification, you
                  can try to:
                </p>
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Attempt to extract code from URL and verify manually
                      const url = new URL(window.location.href);
                      const code = url.searchParams.get("code");

                      if (!code) {
                        toast({
                          title: "Missing Verification Code",
                          description:
                            "No verification code found in URL. Please check your email for a valid link.",
                          variant: "destructive",
                        });
                        return;
                      }

                      toast({
                        title: "Manual Verification",
                        description:
                          "Attempting to manually verify with code...",
                      });

                      // Create a cleaner URL with just the code parameter to avoid any interference
                      const cleanUrl = new URL(
                        "/auth/callback",
                        window.location.origin
                      );
                      cleanUrl.searchParams.append("code", code);
                      cleanUrl.searchParams.append("type", "signup");

                      // Navigate to the clean URL
                      router.push(cleanUrl.toString());
                    }}
                  >
                    Try Manual Verification
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => router.push("/login")}
                    className="text-sm"
                  >
                    Return to Login
                  </Button>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
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
                <p className="text-center text-sm text-green-600 dark:text-green-400">
                  A new verification link has been sent to your email.
                </p>
              )}

              <div className="text-center">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="link"
                    onClick={() => router.push("/login")}
                    className="text-sm text-gray-600 dark:text-gray-300"
                  >
                    Return to Login
                  </Button>
                  <Link
                    href="/support"
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Need help? Contact support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
