"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { User as AppUser } from "./types";

type AuthContextType = {
  user: User | null;
  profile: AppUser | null;
  session: Session | null;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

      if (userError) {
        console.error("Error getting user in fetchProfile:", userError);
        setIsLoading(false);
        return;
      }

      if (!userData?.user) {
        console.error("No user data available in fetchProfile");
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

            console.log("Creating new profile for user:", userId, name, email);

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
              console.log("Created new profile for user:", userId);
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
        console.log("Fetched existing profile for user:", userId);
      } else {
        console.error("No profile data returned but no error");

        // If no data and no error, create a profile as a fallback
        try {
          const name = userData.user.user_metadata?.name || "User";
          const email = userData.user.email || "";

          console.log(
            "Creating fallback profile for user:",
            userId,
            name,
            email
          );

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
            console.log("Created fallback profile for user:", userId);
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
