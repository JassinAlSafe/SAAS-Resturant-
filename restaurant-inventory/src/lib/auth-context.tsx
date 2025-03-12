"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { User } from "./types";

// Define minimal types to avoid dependencies
type Session = {
  user: {
    id: string;
  };
};

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
};

type AuthContextType = {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  isLoading: boolean;
  isRole: (roles: string[]) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ isEmailConfirmationRequired: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if user has a specific role
  const isRole = async (roles: string[]): Promise<boolean> => {
    try {
      // If no profile or user, they don't have any role
      if (!profile || !user) return false;

      // Check if the profile has a role property and if it's included in the requested roles
      if (profile.role && roles.includes(profile.role)) {
        return true;
      }

      // If checking for roles like 'admin' or 'manager' and we need to check the database
      // We can fetch from user_roles table if needed for more complex setups
      if (roles.includes("any") && profile.role) {
        // 'any' role means any authenticated user with a role
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking user role:", error);
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Check if email confirmation is required
      const isEmailConfirmationRequired = !data.session;

      if (data.user) {
        // Create a profile for the new user
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email,
            name,
            role: "staff", // Default role
          },
        ]);

        if (profileError) {
          throw profileError;
        }
      }

      return { isEmailConfirmationRequired };
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
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
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  // Update password with token
  const updatePassword = async (token: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
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
    updatePassword,
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
