"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { checkUserProfileExists } from "@/lib/services/user-profile-service";
import { handleRefreshTokenError } from "@/lib/auth/token-manager";

// Function to check if current page is an auth page where we should skip certain operations
const isAuthPage = () => {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
  return (
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password") ||
    pathname.includes("/auth/") ||
    pathname === "/"
  );
};

// After the isAuthPage function add a function to check for recent logins
const isRecentLogin = () => {
  if (typeof window === "undefined") return false;
  const loginTimestamp = sessionStorage.getItem("loginTimestamp");
  if (!loginTimestamp) return false;

  const loginTime = parseInt(loginTimestamp, 10);
  const now = Date.now();
  const fiveSecondsInMs = 5000;

  // If login was within the last 5 seconds, consider it a recent login
  return now - loginTime < fiveSecondsInMs;
};

// Typed auth state
export type AuthStatus =
  | "initializing" // Auth is still loading
  | "authenticated" // User is signed in
  | "unauthenticated" // User is not signed in
  | "error"; // Error occurred during auth

// Context type definition with comprehensive auth functionality
interface AuthContextType {
  // State
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  hasProfile: boolean;
  isLoading: boolean;
  error: string | null;

  // Core auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;

  // State management
  refreshSession: () => Promise<void>;
  waitForAuth: (timeoutMs?: number) => Promise<boolean>;
  setIsEmailVerified: (isVerified: boolean) => void;
  checkEmailVerification: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: "initializing",
  isAuthenticated: false,
  isEmailVerified: false,
  hasProfile: false,
  isLoading: true,
  error: null,

  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},

  refreshSession: async () => {},
  waitForAuth: async () => false,
  setIsEmailVerified: () => {},
  checkEmailVerification: () => {},
});

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component - the single source of truth for auth state
export function AuthProvider({ children }: AuthProviderProps) {
  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Wait for auth to initialize with timeout
  const waitForAuth = useCallback(
    async (timeoutMs = 10000): Promise<boolean> => {
      // If auth is already initialized, return immediately
      if (status !== "initializing") {
        return status === "authenticated";
      }

      // Otherwise, wait with a timeout
      return new Promise((resolve) => {
        const startTime = Date.now();

        // Set a timeout to avoid hanging
        const timeoutId = setTimeout(() => {
          console.warn(
            `Auth initialization timeout reached after ${timeoutMs}ms`
          );
          resolve(false);
        }, timeoutMs);

        // Check status periodically
        const checkInterval = setInterval(() => {
          if (status !== "initializing") {
            clearTimeout(timeoutId);
            clearInterval(checkInterval);
            resolve(status === "authenticated");
          }

          // Also check for timeout
          if (Date.now() - startTime > timeoutMs) {
            clearInterval(checkInterval);
            // Timeout handled by the timeout above
          }
        }, 100);
      });
    },
    [status]
  );

  // Initialize auth state - only called once during component mounting
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setStatus("initializing");
        setIsLoading(true);

        console.log("Initializing authentication...");

        // Get initial user and session
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (userError) {
          throw userError;
        }

        if (sessionError) {
          throw sessionError;
        }

        // If we have a valid user, fetch additional data
        if (currentUser && currentSession && isMounted) {
          const userId = currentUser.id;

          // Set basic auth state
          setUser(currentUser);
          setSession(currentSession);
          setIsAuthenticated(true);
          setIsEmailVerified(!!currentUser.email_confirmed_at);

          // Check for user profile in parallel, but skip on auth pages
          if (!isAuthPage()) {
            try {
              const profileExists = await checkUserProfileExists(userId);
              if (isMounted) {
                setHasProfile(profileExists);
              }
            } catch (profileError) {
              console.error(
                "Error checking profile during initialization:",
                profileError
              );
              // Non-fatal error, continue with authentication
            }
          } else {
            console.log(
              "On auth page, skipping profile check during initialization"
            );
          }

          // Update status to authenticated
          if (isMounted) {
            setStatus("authenticated");
          }
        } else if (isMounted) {
          // No valid user, set unauthenticated
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
          setIsEmailVerified(false);
          setHasProfile(false);
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setError("Failed to initialize authentication");
          setStatus("error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);

      if (event === "SIGNED_IN" && session?.user && isMounted) {
        setIsLoading(true);

        try {
          // Get the authenticated user
          const {
            data: { user: currentUser },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          // Check for recent login
          const justLoggedIn = isRecentLogin();
          if (justLoggedIn) {
            console.log("Recent login detected, setting auth state");
          }

          if (currentUser) {
            setUser(currentUser);
            setSession(session);
            setIsAuthenticated(true);
            setIsEmailVerified(!!currentUser.email_confirmed_at);
            setStatus("authenticated");

            // Skip profile check for recent logins or on auth pages
            if (!justLoggedIn && !isAuthPage()) {
              try {
                const profileExists = await checkUserProfileExists(
                  currentUser.id
                );
                if (isMounted) {
                  setHasProfile(profileExists);
                }
              } catch (profileError) {
                console.error(
                  "Error checking profile on sign in:",
                  profileError
                );
              }
            }
          }
        } catch (error) {
          console.error("Error handling sign in:", error);
          if (isMounted) {
            setError("Failed to process sign in");
            setStatus("error");
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else if (event === "SIGNED_OUT" && isMounted) {
        // Clear all auth state
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        setHasProfile(false);
        setStatus("unauthenticated");
        setIsLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session && isMounted) {
        // Just update session info
        setSession(session);
        setUser(session.user);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods with consolidated error handling and state management
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus("initializing"); // Reset status while attempting login

      console.log("Attempting sign in...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        if (error.message === "Invalid login credentials") {
          setError("Invalid email or password");
        } else {
          setError("Failed to sign in: " + error.message);
        }
        setStatus("unauthenticated");
        throw error;
      }

      // Set login timestamp for recent login detection
      sessionStorage.setItem("loginTimestamp", Date.now().toString());

      // Verify we have both user and session
      if (!data.user || !data.session) {
        const err = new Error("Login succeeded but no user/session returned");
        console.error(err);
        setError("Authentication failed");
        setStatus("error");
        throw err;
      }

      // Success path - set initial state
      // (Auth state change listener will handle the rest)
      setUser(data.user);
      setSession(data.session);
      setIsAuthenticated(true);
      setIsEmailVerified(!!data.user.email_confirmed_at);
      setStatus("authenticated");

      console.log("Sign in successful, user authenticated");
    } catch (error) {
      // Error already handled above
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Signing up...");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // The user needs to verify their email
      setUser(data.user);
      setSession(data.session);
      setIsAuthenticated(!!data.session);
      setIsEmailVerified(false);
      setHasProfile(false);
      setStatus(data.session ? "authenticated" : "unauthenticated");

      console.log("Sign up successful - email verification may be required");
    } catch (error) {
      console.error("Sign up error:", error);
      setError("Failed to sign up");
      setStatus("error");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Signing out...");

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Auth state change listener will handle the rest
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      setError("Failed to sign out");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Sending password reset email...");

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Failed to reset password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Updating password...");

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Update password error:", error);
      setError("Failed to update password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Refreshing session...");

      const {
        data: { session: refreshedSession },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        const handled = await handleRefreshTokenError(error);
        if (handled) return;
        throw error;
      }

      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        setIsAuthenticated(true);
        setIsEmailVerified(!!refreshedSession.user.email_confirmed_at);
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      setError("Failed to refresh session");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailVerification = () => {
    if (user) {
      setIsEmailVerified(!!user.email_confirmed_at);
    }
  };

  // Create the context value with all state and methods
  const value: AuthContextType = {
    user,
    session,
    status,
    isAuthenticated,
    isEmailVerified,
    hasProfile,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    waitForAuth,
    setIsEmailVerified,
    checkEmailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
