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

// Define the context type
interface BusinessProfileContextType {
  profile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

// Create the context with default values
const BusinessProfileContext = createContext<BusinessProfileContextType>({
  profile: null,
  isLoading: false,
  error: null,
  refreshProfile: async () => {},
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

  // Get the authenticated user from the auth context
  const auth = useAuth();

  // Function to fetch the business profile
  const fetchProfile = useCallback(async () => {
    // Check if user is authenticated
    if (!auth.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const profileData = await businessProfileService.getBusinessProfile(
        auth.user.id
      );
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching business profile:", err);
      setError("Failed to load business profile");
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id]);

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
  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Provide the context value
  return (
    <BusinessProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        refreshProfile,
      }}
    >
      {children}
    </BusinessProfileContext.Provider>
  );
}
