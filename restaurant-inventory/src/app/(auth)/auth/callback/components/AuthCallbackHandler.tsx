"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { EmailOtpType } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

interface AuthCallbackHandlerProps {
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setError: (error: string | null) => void;
  setEmail: (email: string) => void;
  isLoading: boolean;
}

interface ProfileInfo {
  id: string;
  email: string | undefined;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
  created_at?: string;
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

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Email verification timeout after 15 seconds");
        setIsLoading(false);
        setError(
          "Verification is taking longer than expected. Please try logging in directly or contact support."
        );
      }
    }, 15000); // 15 seconds timeout

    const handleEmailConfirmation = async () => {
      try {
        setIsLoading(true);
        console.log("Starting email verification process");
        console.log(
          "URL parameters:",
          Object.fromEntries(searchParams.entries())
        );
        console.log("URL hash:", window.location.hash);

        // Check for error in URL query parameters
        const errorDescription = searchParams.get("error_description");
        const errorCode = searchParams.get("error");

        if (errorDescription || errorCode) {
          console.error("Error in URL:", {
            errorDescription,
            errorCode,
          });

          let finalErrorDescription = errorDescription;

          // Handle hash fragment errors (older Supabase auth)
          if (!finalErrorDescription && window.location.hash) {
            try {
              const hashParams = new URLSearchParams(
                window.location.hash.substring(1)
              );
              finalErrorDescription = hashParams.get("error_description");
              console.log("Error from hash:", finalErrorDescription);
            } catch (hashError) {
              console.error("Error parsing hash:", hashError);
            }
          }

          // Set appropriate error message
          const errorMessage =
            "There was a problem verifying your email. Please try again or contact support.";

          // Handle specific error cases
          if (
            (errorDescription && errorDescription.includes("expired")) ||
            (finalErrorDescription && finalErrorDescription.includes("expired"))
          ) {
            setError(
              "Your email verification link has expired (they're valid for 1 hour). Please enter your email below to request a new one."
            );
            // Pre-fill the email field if available from the URL
            const emailFromUrl = searchParams.get("email");
            if (emailFromUrl) {
              setEmail(emailFromUrl);
            }
          } else {
            setError(errorMessage);
          }

          setIsLoading(false);
          return;
        }

        // Extract parameters using Supabase's newer auth flow (with code parameter)
        const code = searchParams.get("code");
        const type = searchParams.get("type") as EmailOtpType | null;
        const next = searchParams.get("next") || "/dashboard"; // Default to dashboard instead of onboarding
        const emailFromUrl = searchParams.get("email");

        if (emailFromUrl) {
          setEmail(emailFromUrl);
        }

        // First try to get an existing session
        const { data: existingSession } = await supabase.auth.getSession();
        console.log(
          "Existing session check:",
          existingSession?.session ? "Found" : "Not found"
        );
        if (existingSession?.session) {
          console.log("Using existing session");
          setIsSuccess(true);
          setIsLoading(false);

          // Redirect to the dashboard after a short delay
          setTimeout(() => {
            router.push(next);
          }, 2000);
          return;
        }

        // If no code is present, check for token in hash (older Supabase auth flow)
        if (!code) {
          console.log("No code parameter found, checking hash for token");
          // Check if we have a hash with access_token (old email confirmation flow)
          if (window.location.hash) {
            try {
              const hashParams = new URLSearchParams(
                window.location.hash.substring(1)
              );
              const accessToken = hashParams.get("access_token");
              const refreshToken = hashParams.get("refresh_token");
              const expiresIn = hashParams.get("expires_in");
              const tokenType = hashParams.get("token_type");

              if (accessToken && refreshToken) {
                console.log("Found tokens in hash, setting session manually", {
                  accessToken: accessToken.substring(0, 5) + "...",
                  refreshToken: refreshToken.substring(0, 5) + "...",
                  expiresIn,
                  tokenType,
                });

                // Set the session manually using the tokens from the URL
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

                if (error) {
                  console.error("Error setting session:", error);
                  throw error;
                }

                if (data.session) {
                  console.log("Session set successfully");
                  setIsSuccess(true);
                  setIsLoading(false);

                  // Redirect to the dashboard after a short delay
                  setTimeout(() => {
                    router.push(next);
                  }, 2000);
                  return;
                }
              }
            } catch (hashError) {
              console.error("Error processing hash parameters:", hashError);
            }
          }

          // If we get here, we couldn't find a valid token in the hash
          setError(
            "No verification code found. Please try the verification link from your email again or request a new one."
          );
          setIsLoading(false);
          return;
        }

        console.log("Verifying with code and type:", { code, type });

        // Verify the email OTP
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: type || "email",
        });

        if (error) {
          console.error("Error verifying email:", error);

          let errorMessage =
            "There was a problem verifying your email. Please try again or contact support.";

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
        if (data.session) {
          setIsSuccess(true);

          // Show success toast
          toast({
            title: "Email Verified Successfully",
            description:
              "Your email has been verified. You'll now be redirected to the dashboard.",
            variant: "default",
          });

          // If this is a signup confirmation, update the user's profile
          if (type === "signup" || !type) {
            try {
              if (data.user) {
                console.log("Setting up user profile for new user");

                // First check if a profile exists
                const { data: profileData, error: profileCheckError } =
                  await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();

                if (
                  profileCheckError &&
                  profileCheckError.code !== "PGRST116"
                ) {
                  // PGRST116 is "no rows returned" which is expected for a new user
                  console.error("Error checking profile:", profileCheckError);
                }

                // Prepare profile data
                const profileInfo: ProfileInfo = {
                  id: data.user.id,
                  email: data.user.email,
                  full_name: data.user.user_metadata?.full_name || null,
                  avatar_url: data.user.user_metadata?.avatar_url || null,
                  updated_at: new Date().toISOString(),
                };

                // If profile doesn't exist, add created_at
                if (!profileData) {
                  console.log("No profile found, creating new profile");
                  profileInfo.created_at = new Date().toISOString();
                } else {
                  console.log("Profile exists, updating profile");
                }

                // Upsert the profile (create or update)
                const { error: upsertError } = await supabase
                  .from("profiles")
                  .upsert(profileInfo);

                if (upsertError) {
                  console.error("Error updating profile:", upsertError);
                  // Continue anyway - don't block the flow if profile update fails
                  console.log("Continuing despite profile update error");
                } else {
                  console.log("Profile updated successfully");
                }

                // Check if the user has a business profile
                const { data: businessData, error: businessError } =
                  await supabase
                    .from("business_profiles")
                    .select("*")
                    .eq("user_id", data.user.id)
                    .maybeSingle();

                if (businessError) {
                  console.error(
                    "Error checking business profile:",
                    businessError
                  );
                  // Continue anyway - don't block the flow
                } else if (!businessData) {
                  console.log("No business profile found, creating one");

                  try {
                    // First create a business profile
                    const {
                      data: newBusinessProfile,
                      error: createBusinessError,
                    } = await supabase
                      .from("business_profiles")
                      .insert({
                        user_id: data.user.id, // Set the user_id field
                        name: "My Restaurant",
                        description: "Restaurant inventory management",
                        address: "",
                        city: "",
                        state: "",
                        postal_code: "",
                        country: "",
                        phone: "",
                        email: data.user.email,
                        website: "",
                        logo_url: "",
                        default_currency: "USD",
                        timezone: "UTC",
                        subscription_status: "trial",
                        trial_ends_at: new Date(
                          Date.now() + 14 * 24 * 60 * 60 * 1000
                        ).toISOString(), // 14 days trial
                        max_users: 1, // Default max users
                        tax_enabled: false, // Default tax setting
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      })
                      .select()
                      .single();

                    if (createBusinessError) {
                      console.error(
                        "Error creating business profile:",
                        createBusinessError
                      );
                      // Continue anyway - don't block the flow
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
                          updated_at: new Date().toISOString(),
                        });

                      if (associationError) {
                        console.error(
                          "Error associating user with business profile:",
                          associationError
                        );

                        // If we fail to create the association, try a direct approach
                        console.log(
                          "Attempting alternative association method"
                        );

                        // Try a simpler insert without additional fields
                        const { error: simpleAssociationError } = await supabase
                          .from("business_profile_users")
                          .insert({
                            user_id: data.user.id,
                            business_profile_id: newBusinessProfile.id,
                            role: "owner",
                          });

                        if (simpleAssociationError) {
                          console.error(
                            "Error with simple association method:",
                            simpleAssociationError
                          );
                        } else {
                          console.log(
                            "Successfully associated user with business profile using simple method"
                          );
                        }
                      } else {
                        console.log(
                          "Successfully associated user with business profile"
                        );
                      }
                    }
                  } catch (businessCreationError) {
                    console.error(
                      "Error in business profile creation flow:",
                      businessCreationError
                    );
                    // Don't block the verification process, continue to dashboard
                  }
                } else {
                  console.log(
                    "Business profile already exists:",
                    businessData.id
                  );
                }
              }
            } catch (profileError) {
              console.error("Error in profile setup flow:", profileError);
              // Don't block the verification process
            }
          }

          // Redirect to the dashboard after a short delay
          setTimeout(() => {
            router.push(next);
          }, 2000);
        } else {
          setError(
            "Verification was successful, but we couldn't establish a session. Please try logging in."
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error during verification:", error);
        setError(
          "An unexpected error occurred. Please try again or contact support."
        );
        setIsLoading(false);
      }
    };

    handleEmailConfirmation();

    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, [
    searchParams,
    router,
    toast,
    isLoading,
    setError,
    setIsLoading,
    setIsSuccess,
    setEmail,
  ]);

  return null;
}

export default AuthCallbackHandler;
