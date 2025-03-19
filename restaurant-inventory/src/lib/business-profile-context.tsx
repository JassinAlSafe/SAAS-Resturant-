"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { BusinessProfile } from "@/lib/types/business-profile";
import { businessProfileService } from "@/lib/services/business-profile-service";
import { profileDebugService } from "@/lib/services/debug/profile-debug-service";
import { useAuth } from "@/lib/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { BusinessType, CurrencyCode } from "@/lib/types/business-profile";

// Define the context type
interface BusinessProfileContextType {
  profile: BusinessProfile | null;
  isLoading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<BusinessProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the context with default values
const BusinessProfileContext = createContext<BusinessProfileContextType>({
  profile: null,
  isLoading: false,
  error: null,
  fetchProfile: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

// Hook for components to use the business profile
export const useBusinessProfile = () => useContext(BusinessProfileContext);

// Function to check if current page is an auth page where we should skip profile fetching
const isAuthPage = () => {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
  return (
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password") ||
    pathname.includes("/auth/") ||
    pathname === "/"
  );
};

// Function to check if user just logged in
const isRecentLogin = () => {
  const loginTimestamp = sessionStorage.getItem("loginTimestamp");
  if (!loginTimestamp) return false;
  const loginTime = parseInt(loginTimestamp, 10);
  return Date.now() - loginTime < 5000; // Within 5 seconds
};

// Provider component props
interface BusinessProfileProviderProps {
  children: ReactNode;
}

// Provider component that fetches and provides business profile data
export const BusinessProfileProvider = ({
  children,
}: BusinessProfileProviderProps) => {
  // Use the unified auth context
  const { user, status, waitForAuth } = useAuth();

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Maximum number of retries for profile fetch
  const MAX_RETRIES = 3;

  // Fetch the business profile
  const fetchProfile = useCallback(
    async (silent = false) => {
      // Skip fetching on auth pages
      if (isAuthPage()) {
        console.log("On auth page, skipping business profile fetch");
        if (!silent) setIsLoading(false);
        return;
      }

      // Skip fetch if auth isn't ready
      if (status === "initializing") {
        console.log("Auth is still initializing, skipping profile fetch");
        return;
      }

      // Only attempt to fetch if user is authenticated and has an ID
      if (!user?.id || status !== "authenticated") {
        console.log("No authenticated user, skipping profile fetch");
        if (!silent) {
          setIsLoading(false);
          setError(null);
          setProfile(null);
        }
        return;
      }

      if (!silent) setIsLoading(true);

      try {
        console.log("Fetching profile for user:", user.id);

        // Run diagnostics if this is a retry
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount}, running diagnostics...`);
          const diagnosis = await profileDebugService.diagnoseProfileAccess(
            user.id
          );
          console.log("Profile access diagnosis:", diagnosis);
        }

        let businessProfile;
        try {
          businessProfile = await businessProfileService.getBusinessProfile(
            user.id
          );
        } catch (profileError) {
          // If this is recent login, handle differently
          if (isRecentLogin()) {
            console.log(
              "Login detected but no profile found. Will redirect to onboarding."
            );
            setProfile(null);

            // Check if we already headed to onboarding
            if (!window.location.pathname.startsWith("/onboarding")) {
              router.push("/onboarding");
            }
            return;
          } else {
            // Re-throw error for normal flow
            console.error("Error fetching profile:", profileError);
            setError(
              profileError instanceof Error
                ? profileError
                : new Error("Failed to fetch business profile")
            );
            setIsLoading(false);
            return;
          }
        }

        // More detailed logging of the received profile
        console.log(
          "Raw business profile response:",
          JSON.stringify(
            {
              received: !!businessProfile,
              id: businessProfile?.id,
              name: businessProfile?.name,
              type: businessProfile?.type,
              email: businessProfile?.email,
            },
            null,
            2
          )
        );

        // Validate the business profile object
        const validation =
          profileDebugService.validateProfileObject(businessProfile);

        if (!validation.isValid) {
          console.error("Invalid business profile data received:", {
            missingFields: validation.missingFields,
            profile: businessProfile,
          });
          throw new Error(
            `Invalid business profile data received. Missing fields: ${validation.missingFields.join(
              ", "
            )}`
          );
        }

        // If we have a valid profile, use it
        if (validation.profile) {
          console.log("Setting valid business profile:", businessProfile.id);
          setProfile(validation.profile);
          setError(null);
          setRetryCount(0); // Reset retry count on success
          return;
        }

        // If no valid profile exists, create one for new users
        if (isRecentLogin()) {
          console.log("Recent login detected, creating new business profile");
          try {
            console.log("Creating profile with the following data:", {
              name: "My Restaurant",
              type: BusinessType.CASUAL_DINING,
              email: user.email || "",
            });

            const newProfile =
              await businessProfileService.createBusinessProfile(user.id, {
                name: "My Restaurant",
                type: BusinessType.CASUAL_DINING,
                address: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
                phone: "",
                email: user.email || "",
                website: "",
                logo: null,
                operatingHours: {
                  monday: { open: "09:00", close: "17:00", closed: false },
                  tuesday: { open: "09:00", close: "17:00", closed: false },
                  wednesday: { open: "09:00", close: "17:00", closed: false },
                  thursday: { open: "09:00", close: "17:00", closed: false },
                  friday: { open: "09:00", close: "17:00", closed: false },
                  saturday: { open: "09:00", close: "17:00", closed: false },
                  sunday: { open: "09:00", close: "17:00", closed: false },
                },
                defaultCurrency: CurrencyCode.USD,
                taxRate: 0,
                taxEnabled: false,
                taxName: "Sales Tax",
                subscriptionPlan: "free",
                subscriptionStatus: "active",
                maxUsers: 5,
              });

            if (newProfile) {
              console.log("Created new business profile:", newProfile.id);
              setProfile(newProfile);
              setError(null);
              setRetryCount(0);
              return;
            } else {
              console.error(
                "Profile creation returned null or undefined profile"
              );
            }
          } catch (createError) {
            console.error("Error creating new business profile:", createError);
            // Even if profile creation fails, continue to attempt redirection to onboarding
          }
        }

        // If we get here, we don't have a valid profile
        console.warn("No valid business profile returned");

        // Check if we need to redirect to onboarding
        if (!silent && !isRecentLogin()) {
          if (
            !window.location.pathname.startsWith("/onboarding") &&
            !window.location.pathname.startsWith("/dashboard") &&
            !isAuthPage()
          ) {
            console.log("Redirecting to onboarding");
            router.push("/onboarding");
            return;
          }
        }

        // Set profile to null to indicate no valid profile
        setProfile(null);
        throw new Error("No valid business profile data returned");
      } catch (err) {
        console.error("Error fetching business profile:", err);

        // Only show error UI if this isn't a silent retry
        if (!silent) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch business profile")
          );

          // If this is a user who just logged in, don't show errors
          if (isRecentLogin()) {
            console.log("Recent login detected, suppressing profile error");
            return;
          }

          // Only show error toast if this isn't a silent retry and we're not on the onboarding page or dashboard or an auth page
          if (
            !window.location.pathname.startsWith("/onboarding") &&
            !window.location.pathname.startsWith("/dashboard") &&
            !isAuthPage()
          ) {
            // Check if this is a row-level security error
            const errorMessage = err instanceof Error ? err.message : "";
            if (
              errorMessage.includes("row-level security policy") ||
              errorMessage.includes("RLS") ||
              errorMessage.includes("permission denied")
            ) {
              toast({
                title: "Permission Error",
                description:
                  "You don't have permission to access this business profile. Please contact your administrator.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Error loading profile",
                description:
                  "There was a problem loading your business profile. We'll try again shortly.",
                variant: "destructive",
              });
            }
          }
        }

        // If we've exceeded retries and we're not already on onboarding or an auth page or dashboard, redirect to onboarding
        if (
          retryCount >= MAX_RETRIES &&
          !window.location.pathname.startsWith("/onboarding") &&
          !window.location.pathname.startsWith("/dashboard") &&
          !isAuthPage() &&
          !isRecentLogin()
        ) {
          if (!silent) {
            toast({
              title: "Profile Not Found",
              description: "You need to complete your business profile setup.",
            });
          }
          router.push("/onboarding");
          return;
        }

        // Schedule a retry with backoff if we haven't exceeded retries and we're not on an auth page
        if (retryCount < MAX_RETRIES && !isAuthPage() && !isRecentLogin()) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.log(`Scheduling retry ${retryCount + 1} in ${retryDelay}ms`);
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchProfile(true);
          }, retryDelay);
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [user?.id, status, retryCount, toast, router]
  );

  // Update the business profile
  const updateProfile = useCallback(
    async (data: Partial<BusinessProfile>) => {
      if (!profile?.id) {
        throw new Error("No profile loaded");
      }

      setIsLoading(true);

      try {
        const updatedProfile =
          await businessProfileService.updateBusinessProfile(profile.id, data);

        if (!updatedProfile) {
          throw new Error("Failed to update profile");
        }

        setProfile(updatedProfile);
        toast({
          title: "Profile updated",
          description: "Your business profile has been updated successfully.",
        });
      } catch (err) {
        console.error("Error updating business profile:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update business profile")
        );
        toast({
          title: "Update failed",
          description:
            "Failed to update your business profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [profile?.id, toast]
  );

  // Refresh the business profile
  const refreshProfile = useCallback(async () => {
    // Don't refresh on auth pages
    if (isAuthPage()) return;

    if (!user?.id || status !== "authenticated") return;
    await fetchProfile(true);
  }, [user?.id, status, fetchProfile]);

  // Initialize once on mount to ensure we properly wait for auth
  useEffect(() => {
    // Skip initialization on auth pages
    if (isAuthPage()) {
      console.log("On auth page, skipping business profile initialization");
      setHasInitialized(true);
      return;
    }

    const initialize = async () => {
      // Wait for auth to be ready (not initializing) before doing anything
      console.log("Waiting for auth initialization...");
      const authReady = await waitForAuth(15000); // Increase timeout to 15 seconds
      console.log("Auth initialization completed, ready:", authReady);
      setHasInitialized(true);
    };

    if (!hasInitialized) {
      initialize();
    }
  }, [waitForAuth, hasInitialized]);

  // Effect to load profile when auth state changes
  useEffect(() => {
    // Skip profile loading on auth pages
    if (isAuthPage()) {
      console.log("On auth page, skipping business profile loading");
      return;
    }

    if (!hasInitialized) {
      // Don't do anything until we've waited for auth
      return;
    }

    // Only fetch profile when auth is "authenticated"
    if (status === "authenticated" && user?.id) {
      fetchProfile();
    } else if (status === "unauthenticated") {
      // Clear profile when not authenticated
      setProfile(null);
      setIsLoading(false);
    }
  }, [status, user?.id, fetchProfile, hasInitialized]);

  return (
    <BusinessProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </BusinessProfileContext.Provider>
  );
};
