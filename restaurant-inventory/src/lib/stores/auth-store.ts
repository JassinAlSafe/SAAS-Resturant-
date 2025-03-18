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
    updatePassword: (token: string, newPassword: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    setIsEmailVerified: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            isLoading: true,
            isAuthenticated: false,
            isInitialized: false,
            isEmailVerified: false,

            initialize: async () => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase.auth.getSession();

                    if (error) {
                        console.error("Error initializing auth:", error);
                        set({
                            user: null,
                            session: null,
                            isAuthenticated: false,
                            isLoading: false,
                            isInitialized: true
                        });
                        return;
                    }

                    // Check if we have a valid session
                    if (data?.session) {
                        // Check if email is verified (you might want to customize this logic)
                        const isEmailVerified = data.session.user.email_confirmed_at !== null;

                        set({
                            user: data.session.user,
                            session: data.session,
                            isAuthenticated: true,
                            isEmailVerified,
                            isLoading: false,
                            isInitialized: true
                        });

                        // Set up auth state change listener
                        supabase.auth.onAuthStateChange((event, session) => {
                            console.log("Auth state change:", event);

                            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                                set({
                                    user: session?.user || null,
                                    session,
                                    isAuthenticated: !!session,
                                    isEmailVerified: session?.user.email_confirmed_at !== null
                                });
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
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) {
                        // Special case for "Email not confirmed" error
                        // Allow login but keep isEmailVerified as false
                        if (error.message === "Email not confirmed") {
                            // Try to get the user without password
                            const { data: userData, error: userError } = await supabase.auth.signInWithOtp({
                                email,
                                options: {
                                    shouldCreateUser: false,
                                }
                            });

                            if (userError) {
                                throw error; // If this also fails, throw the original error
                            }

                            // Set authenticated but not verified
                            set({
                                user: userData.user,
                                session: userData.session,
                                isAuthenticated: true,
                                isEmailVerified: false,
                                isLoading: false
                            });
                            return;
                        }
                        throw error;
                    }

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

                    // Create redirect URL with absolute path and all necessary parameters
                    const redirectUrl = new URL('/auth/callback', window.location.origin);
                    // Ensure email is properly encoded
                    redirectUrl.searchParams.set("email", email);

                    console.log("Signup redirect URL:", redirectUrl.toString());
                    console.log("Signup parameters:", {
                        email,
                        name: name || email.split('@')[0],
                        redirectUrl: redirectUrl.toString(),
                        encodedEmail: encodeURIComponent(email)
                    });

                    // Sign up with Supabase
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                name: name || email.split('@')[0],
                                email: email // Store email in user metadata
                            },
                            emailRedirectTo: redirectUrl.toString(),
                        },
                    });

                    if (error) {
                        console.error("Signup error:", error);
                        console.log("Error details:", {
                            message: error.message,
                            status: error.status,
                            name: error.name
                        });
                        throw error;
                    }

                    console.log("Signup response details:", {
                        userId: data.user?.id,
                        identities: data.user?.identities,
                        emailConfirmed: data.user?.email_confirmed_at,
                        hasSession: !!data.session,
                        email: data.user?.email,
                        userMetadata: data.user?.user_metadata
                    });

                    // Check if email confirmation is required
                    const isEmailConfirmationRequired = !data.session ||
                        (data.user?.email_confirmed_at === null);

                    if (isEmailConfirmationRequired) {
                        console.log("Email confirmation required. Verification email should be sent to:", email);
                        console.log("User should receive an email with the verification link containing:", {
                            redirectUrl: redirectUrl.toString(),
                            email: email
                        });
                    } else {
                        console.log("Email confirmation not required - unusual for new signups");
                    }

                    // If email confirmation is not required, set the user as authenticated
                    if (!isEmailConfirmationRequired && data.session && data.user) {
                        console.log("Setting authenticated state for user:", data.user.id);
                        set({
                            user: data.user,
                            session: data.session,
                            isAuthenticated: true,
                            isEmailVerified: true,
                            isLoading: false
                        });
                    } else {
                        // Otherwise, the user needs to confirm their email
                        console.log("Waiting for email verification. Current state:", {
                            userId: data.user?.id,
                            isAuthenticated: false,
                            isEmailVerified: false
                        });
                        set({ isLoading: false });
                    }

                    return { isEmailConfirmationRequired };
                } catch (error) {
                    console.error("Signup process failed:", error);
                    if (error instanceof Error) {
                        console.log("Error details:", {
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                        });
                    }
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

                    if (error) {
                        throw error;
                    }

                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            updatePassword: async (token, newPassword) => {
                try {
                    set({ isLoading: true });

                    // Use the token to update the password
                    const { error } = await supabase.auth.updateUser({
                        password: newPassword,
                    });

                    if (error) {
                        throw error;
                    }

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

                    if (error) {
                        throw error;
                    }

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
            name: "auth-storage", // Name for localStorage
            partialize: (state) => ({
                // Only persist these fields to localStorage
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