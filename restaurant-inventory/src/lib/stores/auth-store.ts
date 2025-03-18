import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { type User, type Session } from "@supabase/supabase-js";

interface AuthState {
    // State
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isInitialized: boolean;
    isEmailVerified: boolean;

    // Actions
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name?: string) => Promise<{ isEmailConfirmationRequired: boolean }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    setIsEmailVerified: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            isInitialized: false,
            isEmailVerified: false,

            initialize: async () => {
                set({ isLoading: true });
                try {
                    // Get current authenticated user (more secure than getSession)
                    const { data: userData, error: userError } = await supabase.auth.getUser();

                    if (userError) {
                        console.error("Error initializing auth:", userError);
                        set({
                            user: null,
                            session: null,
                            isAuthenticated: false,
                            isLoading: false,
                            isInitialized: true
                        });
                        return;
                    }

                    // Check if we have a valid user
                    if (userData?.user) {
                        // Check if email is verified
                        const isEmailVerified = userData.user.email_confirmed_at !== null;

                        // After confirming authenticated user, we can safely get the session data
                        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                        if (sessionError) {
                            console.error("Error getting session:", sessionError);
                        }

                        set({
                            user: userData.user,
                            session: sessionData?.session || null,
                            isAuthenticated: true,
                            isEmailVerified,
                            isLoading: false,
                            isInitialized: true
                        });

                        // Set up secure auth state change listener
                        supabase.auth.onAuthStateChange(async (event, session) => {
                            // Skip redundant INITIAL_SESSION event if we just initialized with the same user
                            if (event === 'INITIAL_SESSION' && session?.user?.id === userData.user.id) {
                                return;
                            }

                            // For login and token refresh events, validate the user with getUser
                            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                                try {
                                    // Always verify with getUser for security
                                    const { data: verifiedUser, error: verifyError } = await supabase.auth.getUser();
                                    if (verifyError || !verifiedUser.user) {
                                        console.error("Failed to verify user on auth state change:", verifyError);
                                        // Handle invalid auth state
                                        set({
                                            user: null,
                                            session: null,
                                            isAuthenticated: false,
                                            isEmailVerified: false
                                        });
                                        return;
                                    }

                                    // Use the verified user data
                                    set({
                                        user: verifiedUser.user,
                                        session,
                                        isAuthenticated: true,
                                        isEmailVerified: verifiedUser.user.email_confirmed_at !== null
                                    });
                                } catch (err) {
                                    console.error("Error verifying auth state:", err);
                                    // Reset auth state on error
                                    set({
                                        user: null,
                                        session: null,
                                        isAuthenticated: false,
                                        isEmailVerified: false
                                    });
                                }
                            } else if (event === 'SIGNED_OUT') {
                                set({
                                    user: null,
                                    session: null,
                                    isAuthenticated: false,
                                    isEmailVerified: false
                                });
                            }
                        });
                    } else {
                        set({
                            user: null,
                            session: null,
                            isAuthenticated: false,
                            isLoading: false,
                            isInitialized: true
                        });
                    }
                } catch (error) {
                    console.error("Unexpected error during auth initialization:", error);
                    set({
                        user: null,
                        session: null,
                        isAuthenticated: false,
                        isLoading: false,
                        isInitialized: true
                    });
                }
            },

            signIn: async (email, password) => {
                try {
                    set({ isLoading: true });

                    // Sign in with email/password
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) {
                        throw error;
                    }

                    // Update auth state
                    set({
                        user: data.user,
                        session: data.session,
                        isAuthenticated: true,
                        isEmailVerified: data.user?.email_confirmed_at !== null,
                        isLoading: false
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            signUp: async (email, password, name) => {
                try {
                    set({ isLoading: true });
                    console.log("Starting signup process for:", email);

                    // Create redirect URL with absolute path
                    const redirectUrl = new URL('/auth/callback', window.location.origin);
                    redirectUrl.searchParams.set("email", email);

                    console.log("Signup redirect URL:", redirectUrl.toString());

                    // Sign up with Supabase
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                name: name || email.split('@')[0],
                                email
                            },
                            emailRedirectTo: redirectUrl.toString(),
                        },
                    });

                    if (error) {
                        console.error("Signup error:", error);
                        throw error;
                    }

                    console.log("Signup response details:", {
                        userId: data.user?.id,
                        emailConfirmed: data.user?.email_confirmed_at,
                        hasSession: !!data.session
                    });

                    // Check if email confirmation is required
                    const isEmailConfirmationRequired = !data.session ||
                        (data.user?.email_confirmed_at === null);

                    if (!isEmailConfirmationRequired && data.session && data.user) {
                        // If email confirmation is not required, set the user as authenticated
                        set({
                            user: data.user,
                            session: data.session,
                            isAuthenticated: true,
                            isEmailVerified: true,
                            isLoading: false
                        });
                    } else {
                        // User needs to confirm their email
                        set({ isLoading: false });
                    }

                    return { isEmailConfirmationRequired };
                } catch (error) {
                    console.error("Signup process failed:", error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            signOut: async () => {
                try {
                    set({ isLoading: true });
                    await supabase.auth.signOut();
                    set({
                        user: null,
                        session: null,
                        isAuthenticated: false,
                        isEmailVerified: false,
                        isLoading: false
                    });
                } catch (error) {
                    console.error("Error signing out:", error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            resetPassword: async (email) => {
                try {
                    set({ isLoading: true });

                    // Create redirect URL
                    const redirectUrl = new URL('/reset-password', window.location.origin);

                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: redirectUrl.toString(),
                    });

                    if (error) throw error;
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            updatePassword: async (newPassword) => {
                try {
                    set({ isLoading: true });

                    const { error } = await supabase.auth.updateUser({
                        password: newPassword,
                    });

                    if (error) throw error;
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            refreshSession: async () => {
                try {
                    set({ isLoading: true });
                    const { data, error } = await supabase.auth.refreshSession();

                    if (error) throw error;

                    set({
                        user: data.user,
                        session: data.session,
                        isAuthenticated: !!data.session,
                        isEmailVerified: data.user?.email_confirmed_at !== null,
                        isLoading: false
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            setIsEmailVerified: (value) => {
                set({ isEmailVerified: value });
            }
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                isEmailVerified: state.isEmailVerified
            }),
        }
    )
);

// Initialize auth when this module is imported
if (typeof window !== 'undefined') {
    useAuthStore.getState().initialize();
} 