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
import { useAuth } from "@/lib/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

// Function to check if current page is an auth page
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

// Function to check for recent logins
const isRecentLogin = () => {
  if (typeof window === "undefined") return false;
  const loginTimestamp = sessionStorage.getItem("loginTimestamp");
  if (!loginTimestamp) return false;

  const loginTime = parseInt(loginTimestamp, 10);
  const now = Date.now();
  const fiveSecondsInMs = 5000;

  // If login was within the last 5 seconds, consider it a recent login
  return now - loginTime < fiveSecondsInMs;
};

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

// Provider component props
interface BusinessProfileProviderProps {
  children: ReactNode;
}

// Provider component that fetches and provides business profile data
export const BusinessProfileProvider = ({
  children,
}: BusinessProfileProviderProps) => {
  const { user, status, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  // Maximum number of retries for profile fetch
  const MAX_RETRIES = 3;

  // Refresh the business profile
  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    setIsLoading(true);

    try {
      const businessProfile = await businessProfileService.getBusinessProfile(
        user.id
      );

      if (businessProfile && businessProfile.id) {
        setProfile(businessProfile as unknown as BusinessProfile);
        setError(null);
      }
    } catch (err) {
      console.error("Error refreshing business profile:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to refresh business profile")
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

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

        // Attempt to get the business profile
        const businessProfile = await businessProfileService.getBusinessProfile(
          user.id
        );

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

        // If we have a valid profile, use it
        if (
          businessProfile &&
          typeof businessProfile === "object" &&
          businessProfile.id
        ) {
          console.log("Setting valid business profile:", businessProfile.id);
          setProfile(businessProfile as unknown as BusinessProfile);
          setError(null);
          setRetryCount(0); // Reset retry count on success
          return;
        }

        // If no valid profile exists and this is a recent login, create one
        if (isRecentLogin()) {
          console.log("Recent login detected, creating new business profile");
          try {
            const newProfile =
              await businessProfileService.createBusinessProfile(user.id);

            if (newProfile) {
              console.log("Created new business profile:", newProfile.id);
              setProfile(newProfile as unknown as BusinessProfile);
              setError(null);
              setRetryCount(0);
              return;
            }
          } catch (createError) {
            console.error("Error creating new business profile:", createError);
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

        // Only retry if this isn't a silent call and we haven't exceeded retries
        if (!silent && retryCount < MAX_RETRIES) {
          const nextRetry = retryCount + 1;
          console.log(`Scheduling retry ${nextRetry} in ${1000 * nextRetry}ms`);
          setRetryCount(nextRetry);
          setTimeout(() => fetchProfile(false), 1000 * nextRetry);
        } else if (!silent) {
          // Only show error UI if this isn't a silent retry
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
            toast({
              title: "Error loading profile",
              description:
                "There was a problem loading your business profile. We'll try again shortly.",
              variant: "destructive",
            });
          }
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [user?.id, status, router, retryCount, toast]
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

        setProfile(updatedProfile as unknown as BusinessProfile);
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

  // Initialize once on mount
  useEffect(() => {
    // Skip initialization on auth pages
    if (isAuthPage()) {
      console.log("On auth page, skipping business profile initialization");
      setIsLoading(false);
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
  }, [status, user?.id, fetchProfile]);

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
