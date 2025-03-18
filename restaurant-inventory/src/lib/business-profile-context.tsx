"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { BusinessProfile } from "@/lib/types";
import { businessProfileService } from "@/lib/services/business-profile-service";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Maximum number of retries for profile fetch
  const MAX_RETRIES = 3;

  // Validate user authentication securely
  const validateAuth = useCallback(async () => {
    try {
      // Always use getUser() instead of getSession() for security
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        return null;
      }
      return data.user;
    } catch (err) {
      console.error("Error validating auth:", err);
      return null;
    }
  }, []);

  // Refresh the business profile
  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Validate user auth
      const validatedUser = await validateAuth();
      if (!validatedUser) {
        setError(new Error("Authentication validation failed"));
        return;
      }

      setIsLoading(true);
      const businessProfile = await businessProfileService.getBusinessProfile(
        validatedUser.id
      );

      if (businessProfile && businessProfile.id) {
        setProfile(businessProfile);
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
  }, [isAuthenticated, validateAuth]);

  // Fetch the business profile
  const fetchProfile = useCallback(
    async (silent = false) => {
      if (!user || !isAuthenticated) {
        if (!silent) {
          setIsLoading(false);
          setError(null);
          setProfile(null);
        }
        return;
      }

      if (!silent) setIsLoading(true);

      try {
        // Validate user auth
        const validatedUser = await validateAuth();
        if (!validatedUser) {
          throw new Error("Authentication validation failed");
        }

        const businessProfile = await businessProfileService.getBusinessProfile(
          validatedUser.id
        );

        // Handle successful profile fetch
        if (businessProfile && businessProfile.id) {
          setProfile(businessProfile);
          setError(null);
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error("No valid business profile returned");
        }
      } catch (err) {
        console.error("Error fetching business profile:", err);

        // Only show error UI if this isn't a silent retry
        if (!silent) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch business profile")
          );

          // Only show error toast if this isn't a silent retry and we're not on the onboarding page
          if (!window.location.pathname.startsWith("/onboarding")) {
            toast({
              title: "Error loading profile",
              description:
                "There was a problem loading your business profile. We'll try again shortly.",
              variant: "destructive",
            });
          }
        }

        // If we've exceeded retries and we're not already on onboarding, redirect to onboarding
        if (
          retryCount >= MAX_RETRIES &&
          !window.location.pathname.startsWith("/onboarding")
        ) {
          if (!silent) {
            toast({
              title: "Profile Not Found",
              description: "You need to complete your business profile setup.",
            });
          }
          window.location.href = "/onboarding";
          return;
        }

        // Schedule a retry with backoff if we haven't exceeded retries
        if (retryCount < MAX_RETRIES) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchProfile(true);
          }, retryDelay);
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [user, isAuthenticated, retryCount, toast, validateAuth]
  );

  // Update the business profile
  const updateProfile = useCallback(
    async (data: Partial<BusinessProfile>) => {
      if (!profile || !profile.id) {
        throw new Error("No profile loaded");
      }

      setIsLoading(true);

      try {
        // Validate user auth before update
        const validatedUser = await validateAuth();
        if (!validatedUser) {
          throw new Error("Authentication validation failed");
        }

        const updatedProfile =
          await businessProfileService.updateBusinessProfile(profile.id, data);
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
    [profile, toast, validateAuth]
  );

  // Effect to load profile when auth state changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    if (user && isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading, fetchProfile]);

  // Provide the context value
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
