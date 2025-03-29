//Auth context provider using SSR-compatible client

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "../types";
import { useNotificationHelpers } from "../notification-context";
import { authService } from "@/lib/services/auth-service";

// Define minimal types to avoid dependencies
type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
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

// Create regular Supabase browser client
const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Create specialized verification client for auth operations
const createVerificationClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: "supabase-auth-token",
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    }
  );
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const verificationClient = createVerificationClient();
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

    // Listen for auth changes with the correct SSR pattern
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id);

          setSession(session as Session | null);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
            setIsLoading(false);
          }
        }
      );

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

      // Try to get the profile with maybeSingle() instead of single()
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // If profile exists, use it
      if (existingProfile) {
        setProfile({
          id: existingProfile.id,
          email: existingProfile.email,
          name: existingProfile.name,
          role: existingProfile.role,
        });
        setIsLoading(false);
        return;
      }

      // Handle fetch error if needed
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching profile:", fetchError);
      }

      // Profile doesn't exist or there was an error, create one
      try {
        const name = userData.user.user_metadata?.name || "User";
        const email = userData.user.email || "";

        // Create a new profile
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              email,
              name,
              role: "staff", // Default role
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              email_confirmed: false, // Will be updated after email verification
            },
          ])
          .select()
          .single();

        if (createError) {
          // Handle duplicate key error (race condition)
          if (createError.code === "23505") {
            console.log(
              "Profile already exists due to race condition, fetching it"
            );
            // Profile was created in another concurrent request, try fetching again
            const { data: retryProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();

            if (retryProfile) {
              setProfile({
                id: retryProfile.id,
                email: retryProfile.email,
                name: retryProfile.name,
                role: retryProfile.role,
              });
            }
          } else {
            console.error("Error creating profile:", createError);
          }
        } else if (newProfile) {
          setProfile({
            id: newProfile.id,
            email: newProfile.email,
            name: newProfile.name,
            role: newProfile.role,
          });
        }
      } catch (createError) {
        console.error("Error in profile creation process:", createError);
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
        await fetchProfile(data.user.id);
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

  // Sign up with email and password - using verification client
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Construct the redirect URL with the correct origin and type parameter
      const redirectUrl = new URL("/auth/verification", window.location.origin);
      redirectUrl.searchParams.append("type", "signup");
      redirectUrl.searchParams.append("email", encodeURIComponent(email));

      // Add a random state parameter to prevent CSRF attacks
      const state = Math.random().toString(36).substring(2);
      redirectUrl.searchParams.append("state", state);

      console.log("Using redirect URL:", redirectUrl.toString());

      // Use verification client for signup
      const { data, error } = await verificationClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            signup_completed: false,
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
        "Please check your email to verify your account. The verification link will expire in 1 hour."
      );

      // Check if email confirmation is required
      const isEmailConfirmationRequired = !data.session;

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
      // First clear the local state
      setUser(null);
      setProfile(null);
      setSession(null);

      // Then sign out from Supabase
      await supabase.auth.signOut();

      // Use the auth service for a comprehensive logout
      await authService.logout();
    } catch (error) {
      console.error("Error signing out:", error);
      showError(
        "Logout Failed",
        "There was an error signing out. Please try again."
      );
    }
  };

  // Reset password - using verification client
  const resetPassword = async (email: string) => {
    try {
      // Use verification client for password reset
      const { error } = await verificationClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

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

  // Update user password with secure confirmation - using verification client
  const updateUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      // First verify the current password by attempting to sign in
      const { data: userData } = await verificationClient.auth.getUser();
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
        // Verify current password using verification client
        const { error: signInError } =
          await verificationClient.auth.signInWithPassword({
            email: userData.user.email,
            password: currentPassword,
          });

        if (signInError) {
          throw new Error("Current password is incorrect");
        }
      }

      // Update the password using verification client
      const { error } = await verificationClient.auth.updateUser({
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during password update";
      return { success: false, error: errorMessage };
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
