"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EmailOtpType, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/browser-client";

interface AuthCallbackHandlerProps {
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setError: (error: string | null) => void;
  setEmail: (email: string) => void;
  isLoading: boolean;
}

// Typed interfaces for profile creation
interface ProfileInfo {
  id: string;
  email: string | undefined;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
  created_at?: string;
}

interface BusinessProfileInfo {
  user_id: string;
  name: string;
  description: string;
  email: string | undefined;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  website: string;
  logo_url: string;
  default_currency: string;
  timezone: string;
  subscription_status: string;
  trial_ends_at: string;
  max_users: number;
  tax_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * AuthCallbackHandler Component
 *
 * Handles Supabase authentication callbacks for email verification,
 * supporting both new (OTP) and legacy (token hash) flows.
 */
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
  const supabase = createClient();

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

    // Safety timeout to prevent infinite loading state
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Email verification timeout after 15 seconds");
        handleVerificationError(
          "Verification is taking longer than expected. Please try logging in directly or contact support."
        );
      }
    }, 15000);

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
          await handleErrorParameters(
            errorDescription,
            errorCode,
            emailFromUrl
          );
          return;
        }

        // Check for existing session
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session) {
          console.log("Using existing session");
          if (isMounted) handleSuccess(next);
          return;
        }

        // Handle different verification flows
        if (code) {
          // Modern OTP verification flow
          await handleOtpVerification(code, type, next);
        } else {
          // Legacy hash token verification flow
          const wasHandled = await handleHashTokenVerification(next);

          if (!wasHandled && isMounted) {
            handleVerificationError(
              "No verification code found. Please try the verification link from your email again or request a new one."
            );
          }
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

    // Helper function to handle URL error parameters
    const handleErrorParameters = async (
      errorDescription: string | null,
      errorCode: string | null,
      emailFromUrl: string | null
    ) => {
      console.error("Error in URL:", { errorDescription, errorCode });
      let finalErrorDescription = errorDescription;

      // Check for hash errors if no description found
      if (!finalErrorDescription && window.location.hash) {
        try {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          finalErrorDescription = hashParams.get("error_description");
          const hashErrorCode = hashParams.get("error_code");

          console.log("Error from hash:", {
            errorCode: hashErrorCode,
            errorDescription: finalErrorDescription,
          });
        } catch (hashError) {
          console.error("Error parsing hash:", hashError);
        }
      }

      // Determine appropriate error message
      const isExpired =
        (errorDescription && errorDescription.includes("expired")) ||
        (finalErrorDescription && finalErrorDescription.includes("expired"));

      if (isExpired && isMounted) {
        handleVerificationError(
          "Your email verification link has expired (they're valid for 1 hour). Please enter your email below to request a new one.",
          emailFromUrl
        );
      } else if (isMounted) {
        handleVerificationError(
          "There was a problem verifying your email. Please try again or contact support."
        );
      }
    };

    // Helper function to handle OTP verification
    const handleOtpVerification = async (
      code: string,
      type: EmailOtpType | null,
      next: string
    ) => {
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

        if (isMounted) handleVerificationError(errorMessage);
        return;
      }

      // Successfully verified
      console.log("Authentication success:", {
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        userId: data?.user?.id,
      });

      if (data.session) {
        // Set up user profile for new signups
        if ((type === "signup" || !type) && data.user) {
          try {
            console.log("Setting up user profile for new user");
            await setupUserProfile(data.user);
          } catch (profileError) {
            console.error("Error in profile setup flow:", profileError);
            // Don't block verification process
          }
        }

        if (isMounted) handleSuccess(next);
      } else if (isMounted) {
        handleVerificationError(
          "Verification was successful, but we couldn't establish a session. Please try logging in."
        );
      }
    };

    // Helper function to handle legacy hash token verification
    const handleHashTokenVerification = async (
      next: string
    ): Promise<boolean> => {
      console.log("No code parameter found, checking hash for token");

      if (!window.location.hash) {
        return false;
      }

      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          return false;
        }

        console.log("Found tokens in hash, setting session manually", {
          accessToken: accessToken.substring(0, 5) + "...",
          refreshToken: refreshToken.substring(0, 5) + "...",
        });

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
          throw error;
        }

        if (data.session && isMounted) {
          console.log("Session set successfully");
          handleSuccess(next);
          return true;
        }

        return false;
      } catch (hashError) {
        console.error("Error processing hash parameters:", hashError);
        return false;
      }
    };

    // Start the verification process
    verifyEmail();

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    searchParams,
    setIsLoading,
    setIsSuccess,
    setError,
    setEmail,
    handleSuccess,
    handleVerificationError,
    isLoading,
    router,
    toast,
  ]);

  return null;
}

/**
 * Sets up user profile after successful verification
 */
async function setupUserProfile(user: User): Promise<void> {
  const supabase = createClient();

  try {
    // Check if profile exists
    const { data: profileData, error: profileCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("Error checking profile:", profileCheckError);
    }

    // Prepare profile data
    const profileInfo: ProfileInfo = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString(),
    };

    // Add created_at for new profiles
    if (!profileData) {
      console.log("No profile found, creating new profile");
      profileInfo.created_at = new Date().toISOString();
    } else {
      console.log("Profile exists, updating profile");
    }

    // Upsert profile
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(profileInfo);

    if (upsertError) {
      console.error("Error updating profile:", upsertError);
    } else {
      console.log("Profile updated successfully");
    }

    // Setup business profile
    await setupBusinessProfile(user);
  } catch (error) {
    console.error("Error in profile setup:", error);
  }
}

/**
 * Sets up business profile for new users
 */
async function setupBusinessProfile(user: User): Promise<void> {
  const supabase = createClient();

  try {
    // Check if business profile exists
    const { data: businessData, error: businessError } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (businessError) {
      console.error("Error checking business profile:", businessError);
      return;
    }

    // Create new business profile if none exists
    if (!businessData) {
      await createBusinessProfile(user);
    } else {
      console.log("Business profile already exists:", businessData.id);
    }
  } catch (error) {
    console.error("Error in business profile setup:", error);
  }
}

/**
 * Creates a new business profile
 */
async function createBusinessProfile(user: User): Promise<void> {
  const supabase = createClient();

  console.log("No business profile found, creating one");

  try {
    // Prepare business profile data
    const businessProfileInfo: BusinessProfileInfo = {
      user_id: user.id,
      name: "My Restaurant",
      description: "Restaurant inventory management",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      phone: "",
      email: user.email,
      website: "",
      logo_url: "",
      default_currency: "USD",
      timezone: "UTC",
      subscription_status: "trial",
      trial_ends_at: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(), // 14 days trial
      max_users: 1,
      tax_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create business profile
    const { data: newBusinessProfile, error: createBusinessError } =
      await supabase
        .from("business_profiles")
        .insert(businessProfileInfo)
        .select()
        .single();

    if (createBusinessError) {
      console.error("Error creating business profile:", createBusinessError);
      return;
    }

    if (newBusinessProfile) {
      console.log(
        "Successfully created business profile:",
        newBusinessProfile.id
      );

      // Associate user with business profile
      await associateUserWithBusiness(user.id, newBusinessProfile.id);
    }
  } catch (error) {
    console.error("Error creating business profile:", error);
  }
}

/**
 * Associates user with business profile
 */
async function associateUserWithBusiness(
  userId: string,
  businessProfileId: string
): Promise<void> {
  const supabase = createClient();

  try {
    // Try full association first
    const { error: associationError } = await supabase
      .from("business_profile_users")
      .insert({
        user_id: userId,
        business_profile_id: businessProfileId,
        role: "owner",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    // If error, try simplified version
    if (associationError) {
      console.error(
        "Error associating user with business profile:",
        associationError
      );
      console.log("Attempting alternative association method");

      const { error: simpleAssociationError } = await supabase
        .from("business_profile_users")
        .insert({
          user_id: userId,
          business_profile_id: businessProfileId,
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
      console.log("Successfully associated user with business profile");
    }
  } catch (error) {
    console.error("Error associating user with business:", error);
  }
}

export default AuthCallbackHandler;
