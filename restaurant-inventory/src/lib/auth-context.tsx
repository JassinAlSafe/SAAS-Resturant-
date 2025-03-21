"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { User } from "./types";
import { useNotificationHelpers } from "./notification-context";

// Define minimal types to avoid dependencies
type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number; // Make optional to match Supabase's type
  user: {
    id: string;
    email?: string;
  };
};

type SupabaseUser = {
  id: string;
  email?: string;
  identities?: Array<unknown>;
};

type AuthContextType = {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  isLoading: boolean;
  isRole: (roles: string[]) => Promise<boolean>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ isEmailConfirmationRequired: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success: showSuccess, error: showError } = useNotificationHelpers();

  // Function to check if user has a specific role
  const isRole = async (roles: string[]): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        return false;
      }

      return roles.includes(data.role);
    } catch (error) {
      console.error("Error checking role:", error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionData = data.session as Session | null;

        setSession(sessionData);
        setUser(sessionData?.user ?? null);

        if (sessionData?.user) {
          await fetchProfile(sessionData.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session as Session | null);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      });

      return () => {
        data.subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setIsLoading(false);
      return () => {};
    }
  }, []);

  // Fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    if (!userId) {
      console.error("fetchProfile called with no userId");
      setIsLoading(false);
      return;
    }

    try {
      // First check if the user exists
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.error(
          "Error getting user in fetchProfile:",
          userError || "No user data"
        );
        setIsLoading(false);
        return;
      }

      // Try to get the profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);

        // If the profile doesn't exist, create one
        if (error.code === "PGRST116") {
          try {
            const name = userData.user.user_metadata?.name || "User";
            const email = userData.user.email || "";

            // Create a new profile
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: userId,
                  email,
                  name,
                  role: "staff", // Default role
                },
              ]);

            if (insertError) {
              console.error("Error creating profile:", insertError);
            } else {
              // Set the profile after creation
              setProfile({
                id: userId,
                email,
                name,
                role: "staff",
              });
            }
          } catch (createError) {
            console.error("Error in profile creation process:", createError);
          }
        }
      } else if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
        });
      } else {
        // If no data and no error, create a profile as a fallback
        try {
          const name = userData.user.user_metadata?.name || "User";
          const email = userData.user.email || "";

          // Create a new profile
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: userId,
                email,
                name,
                role: "staff", // Default role
              },
            ]);

          if (insertError) {
            console.error("Error creating fallback profile:", insertError);
          } else {
            // Set the profile after creation
            setProfile({
              id: userId,
              email,
              name,
              role: "staff",
            });
          }
        } catch (createError) {
          console.error("Error in fallback profile creation:", createError);
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Set the user and session in state
      setUser(data.user);
      setSession(data.session);

      // Fetch the user's profile
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!profileError && profileData) {
          setProfile(profileData as User);
        }
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during sign in";
      return { success: false, error: errorMessage };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Construct the redirect URL with the correct origin and type parameter
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.append("type", "signup");

      // Add a random state parameter to prevent CSRF attacks
      const state = Math.random().toString(36).substring(2);
      redirectUrl.searchParams.append("state", state);

      console.log("Using redirect URL:", redirectUrl.toString());

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: redirectUrl.toString(),
        },
      });

      if (error) {
        throw error;
      }

      // Check if user needs to confirm their email
      if (data?.user && data.user.identities?.length === 0) {
        throw new Error(
          "This email is already registered. Please log in instead."
        );
      }

      // Set the user in state but DO NOT clear the session
      setUser(data.user);

      // Show success notification with more detailed instructions
      showSuccess(
        "Account Created Successfully",
        "Please check your email to verify your account. The verification link will expire in 1 hour. You can continue setting up your profile in the meantime."
      );

      // Create a profile for the new user with basic fields
      if (data.user) {
        try {
          // Create a basic profile
          const profileData = {
            id: data.user.id,
            email,
            name,
            role: "staff", // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email_confirmed: false, // Will be updated after email verification
          };

          // Insert the profile
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert([profileData], {
              onConflict: "id",
              ignoreDuplicates: false,
            });

          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Don't throw here, allow the signup to complete
          }
        } catch (profileError) {
          console.error("Error in profile creation:", profileError);
        }
      }

      // Check if email confirmation is required
      const isEmailConfirmationRequired = !data.session;

      // Log information about the verification process
      console.log("Email verification required:", isEmailConfirmationRequired);
      console.log("Verification email sent to:", email);
      console.log("PKCE flow enabled for secure verification");

      return { isEmailConfirmationRequired };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during signup";
      showError("Signup Failed", errorMessage);
      return { isEmailConfirmationRequired: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during password reset";
      return { success: false, error: errorMessage };
    }
  };

  // Update user password with secure confirmation
  const updateUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      // First verify the current password by attempting to sign in
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !userData.user.email) {
        throw new Error("User not authenticated");
      }

      // Check if the user has signed in recently (within 24 hours)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("last_sign_in")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const lastSignIn = new Date(profileData.last_sign_in);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // If the user hasn't signed in recently, verify their current password
      if (lastSignIn < twentyFourHoursAgo) {
        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.user.email,
          password: currentPassword,
        });

        if (signInError) {
          throw new Error("Current password is incorrect");
        }
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      // Update last sign in time
      await supabase
        .from("profiles")
        .update({ last_sign_in: new Date().toISOString() })
        .eq("id", userData.user.id);

      return { success: true };
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    isRole,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
