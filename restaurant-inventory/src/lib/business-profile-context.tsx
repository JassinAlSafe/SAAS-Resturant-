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
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";

// Define the context type
interface BusinessProfileContextType {
  profile: BusinessProfile | null;
  isLoading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<BusinessProfile>) => Promise<void>;
}

// Create the context with default values
const BusinessProfileContext = createContext<BusinessProfileContextType>({
  profile: null,
  isLoading: false,
  error: null,
  fetchProfile: async () => {},
  updateProfile: async () => {},
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
  const { user, isLoading: authLoading, session } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Maximum number of retries for profile fetch
  const MAX_RETRIES = 5;

  // Delay between retries (milliseconds) - increases with each retry
  const getRetryDelay = (attempt: number) =>
    Math.min(1000 * Math.pow(1.5, attempt), 10000);

  // Fetch the business profile
  const fetchProfile = useCallback(
    async (silent = false) => {
      if (!user || !user.id) {
        if (!silent) {
          setIsLoading(false);
          setError(new Error("User not authenticated"));
          console.log("Cannot fetch business profile: no authenticated user");
        }
        return;
      }

      if (!silent) setIsLoading(true);

      try {
        const businessProfile = await businessProfileService.getBusinessProfile(
          user.id
        );
        setProfile(businessProfile);
        setError(null);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error("Error fetching business profile:", err);

        // Only show toast on the first error (not during retries)
        if (!silent) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch business profile")
          );
          toast({
            title: "Error loading profile",
            description:
              "There was a problem loading your business profile. We'll try again shortly.",
            variant: "destructive",
          });
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [user, toast]
  );

  // Update the business profile
  const updateProfile = useCallback(
    async (data: Partial<BusinessProfile>) => {
      if (!profile || !profile.id) {
        throw new Error("No profile loaded");
      }

      setIsLoading(true);

      try {
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
    [profile, toast]
  );

  // Effect to load profile when user changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    if (user && session) {
      console.log("Auth state updated, fetching business profile...");
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user, session, authLoading, fetchProfile]);

  // Effect to handle retry logic for profile fetching
  useEffect(() => {
    // Only retry if there's an error, we have a user, and haven't exceeded max retries
    if (error && user && retryCount < MAX_RETRIES) {
      const retryDelay = getRetryDelay(retryCount);
      console.log(
        `Scheduling retry #${
          retryCount + 1
        } for business profile fetch in ${retryDelay}ms`
      );

      const timeoutId = setTimeout(() => {
        console.log(
          `Executing retry #${retryCount + 1} for business profile fetch`
        );
        setRetryCount((prev) => prev + 1);
        fetchProfile(true); // Silent retry
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, user, retryCount, fetchProfile]);

  // Provide the context value
  return (
    <BusinessProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </BusinessProfileContext.Provider>
  );
};
