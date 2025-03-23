"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

// Define custom User type that extends Supabase User with our additional properties
export interface User {
  id: string;
  email?: string;
  phone?: string;
  app_metadata: {
    provider?: string;
    [key: string]: unknown;
  };
  user_metadata: UserMetadata;
  aud: string;
  created_at: string;
  businessProfileId?: string;
}

// Define types for user profile and metadata
interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  businessProfileId?: string;
}

interface UserMetadata {
  first_name?: string;
  last_name?: string;
  businessProfileId?: string;
  [key: string]: unknown; // Allow for additional metadata fields with unknown type
}

// Define types for the auth context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  fetchProfile: () => Promise<UserProfile | null>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user as User);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user as User || null);
        
        if (event === "SIGNED_OUT") {
          // Clear any user-related state
          setUser(null);
          setSession(null);
        } else if (event === "SIGNED_IN" && currentSession) {
          // Update user state
          setUser(currentSession.user as User);
          setSession(currentSession);
        }
      }
    );

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Fetch user profile after sign in
      await fetchProfile();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      if (data) {
        // Update user with business profile ID if available
        if (data.business_profile_id && !user.businessProfileId) {
          setUser({
            ...user,
            businessProfileId: data.business_profile_id
          });
        }
        
        return {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          businessProfileId: data.business_profile_id
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, [user]);

  // Compute isAuthenticated
  const isAuthenticated = !!user && !!session;

  // Create the context value
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
