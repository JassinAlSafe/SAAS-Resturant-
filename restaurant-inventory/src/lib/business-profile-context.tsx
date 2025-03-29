"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { BusinessProfile } from "@/lib/types";
import { businessProfileService } from "@/lib/services/business-profile-service";
import { useAuth } from "@/lib/services/auth-context";

// Define the context type
interface BusinessProfileContextType {
  profile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  getProfileId: () => string | null;
}

// Create the context with default values
const BusinessProfileContext = createContext<BusinessProfileContextType>({
  profile: null,
  isLoading: false,
  error: null,
  refreshProfile: async () => {},
  getProfileId: () => null,
});

// Hook for components to use the business profile
export function useBusinessProfile() {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error(
      "useBusinessProfile must be used within a BusinessProfileProvider"
    );
  }
  return context;
}

// Provider component props
interface BusinessProfileProviderProps {
  children: ReactNode;
}

// Provider component that fetches and provides business profile data
export function BusinessProfileProvider({
  children,
}: BusinessProfileProviderProps) {
  // State for the business profile
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track last fetched time and fetching state
  const lastFetchedRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const cacheExpiryMs = 5 * 60 * 1000; // Cache expires after 5 minutes

  // Get the authenticated user from the auth context
  const auth = useAuth();

  // Function to fetch the business profile with caching and debouncing
  const fetchProfile = useCallback(
    async (forceRefresh = false) => {
      // Check if user is authenticated
      if (!auth.user?.id) {
        setIsLoading(false);
        return;
      }

      // Skip if already fetching to prevent parallel requests
      if (isFetchingRef.current) {
        return;
      }

      // Check if cache is still valid (unless force refresh is requested)
      const now = Date.now();
      if (
        !forceRefresh &&
        profile &&
        now - lastFetchedRef.current < cacheExpiryMs
      ) {
        setIsLoading(false);
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        const profileData = await businessProfileService.getBusinessProfile(
          auth.user.id
        );

        setProfile(profileData);
        lastFetchedRef.current = now;
      } catch (err) {
        console.error("Error fetching business profile:", err);
        setError("Failed to load business profile");
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [auth.user?.id, profile, cacheExpiryMs]
  );

  // Load profile on initial mount or when user changes
  useEffect(() => {
    if (auth.user?.id) {
      fetchProfile();
    } else {
      // Reset state if no user
      setProfile(null);
      setIsLoading(false);
      setError(null);
    }
  }, [auth.user?.id, fetchProfile]);

  // Function to manually refresh the profile
  const refreshProfile = useCallback(async () => {
    await fetchProfile(true);
  }, [fetchProfile]);

  // Helper function to get just the profile ID (useful for optimizing service calls)
  const getProfileId = useCallback(() => {
    return profile?.id || null;
  }, [profile]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      profile,
      isLoading,
      error,
      refreshProfile,
      getProfileId,
    }),
    [profile, isLoading, error, refreshProfile, getProfileId]
  );

  // Provide the context value
  return (
    <BusinessProfileContext.Provider value={contextValue}>
      {children}
    </BusinessProfileContext.Provider>
  );
}
