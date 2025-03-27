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
import { useAuth } from "@/lib/services/auth-context";

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
    console.log("fetchProfile called, auth.user?.id:", auth.user?.id);

    if (!auth.user?.id) {
      console.log("No authenticated user, skipping profile fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching business profile for user ID:", auth.user.id);

      const profileData = await businessProfileService.getBusinessProfile(
        auth.user.id
      );
      console.log("Business profile data received:", profileData);
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
    console.log(
      "BusinessProfileProvider useEffect triggered, user ID:",
      auth.user?.id
    );

    if (auth.user?.id) {
      console.log("User authenticated, fetching profile");
      fetchProfile();
    } else {
      // Reset state if no user
      console.log("No authenticated user, resetting profile state");
      setProfile(null);
      setIsLoading(false);
      setError(null);
    }
  }, [auth.user?.id, fetchProfile]);

  // Function to manually refresh the profile
  const refreshProfile = async () => {
    console.log("Manual profile refresh requested");
    await fetchProfile();
  };

  console.log("BusinessProfileProvider rendering with profile:", profile?.id);

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
