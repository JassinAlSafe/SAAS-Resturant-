"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./auth-context";

// Define the business profile type
interface BusinessProfile {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  currency?: string;
}

// Define the business profile context type
interface BusinessProfileContextType {
  businessProfile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshBusinessProfile: () => Promise<void>;
}

// Create the context with default values
const BusinessProfileContext = createContext<BusinessProfileContextType>({
  businessProfile: null,
  isLoading: true,
  error: null,
  refreshBusinessProfile: async () => {},
});

interface BusinessProfileProviderProps {
  children: ReactNode;
}

// Create a provider component
export function BusinessProfileProvider({ children }: BusinessProfileProviderProps) {
  const { user } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the business profile
  const fetchBusinessProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch the business profile from the API
      const response = await fetch(`/api/business-profile/${user.businessProfileId || user.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch business profile: ${response.statusText}`);
      }

      const data = await response.json();
      setBusinessProfile(data);
    } catch (err) {
      console.error("Error fetching business profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch business profile");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.businessProfileId]);

  // Fetch the business profile when the user changes
  useEffect(() => {
    if (user?.id) {
      fetchBusinessProfile();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, fetchBusinessProfile]);

  // Function to refresh the business profile
  const refreshBusinessProfile = async () => {
    await fetchBusinessProfile();
  };

  const value = {
    businessProfile,
    isLoading,
    error,
    refreshBusinessProfile,
  };

  return (
    <BusinessProfileContext.Provider value={value}>
      {children}
    </BusinessProfileContext.Provider>
  );
}

// Create a hook to use the business profile context
export function useBusinessProfile() {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error("useBusinessProfile must be used within a BusinessProfileProvider");
  }
  return context;
}
