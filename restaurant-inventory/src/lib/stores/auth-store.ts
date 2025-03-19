import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, handleAuthError } from "@/lib/supabase";
import { type User, type Session, AuthError } from "@supabase/supabase-js";
import { checkUserProfileExists, updateEmailConfirmedStatus } from "@/lib/services/user-profile-service";
import { type StoreApi, type SetState, type GetState } from 'zustand';

// Constants for error handling
const AUTH_ERROR_CODES = {
    REFRESH_TOKEN_NOT_FOUND: 'Refresh Token Not Found',
    INVALID_REFRESH_TOKEN: 'Invalid Refresh Token',
    TOKEN_EXPIRED: 'Token expired'
} as const;

// Helper to check if we're on auth pages where we want to suppress session refresh
const isAuthPage = () => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname;
    return pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/auth/callback');
};

interface AuthState {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    hasProfile: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthStore extends AuthState {
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    setIsEmailVerified: (isVerified: boolean) => void;
    checkEmailVerification: () => void;
}

const REFRESH_THRESHOLD = 10 * 60; // 10 minutes in seconds

function isSessionExpiringSoon(session: Session | null): boolean {
    if (!session?.expires_at) return false;
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    return expiresAt - now < REFRESH_THRESHOLD;
}

// Helper to handle session errors
const handleSessionError = async (
    error: unknown,
    store: AuthStore
) => {
    console.error('Session error:', error);

    // Type guard for AuthError
    const isAuthError = (err: unknown): err is AuthError => {
        return err instanceof AuthError;
    };

    // Type guard for Error
    const isError = (err: unknown): err is Error => {
        return err instanceof Error;
    };

    // Check for specific refresh token errors
    const isRefreshTokenError =
        (isError(error) && (
            error.message?.includes(AUTH_ERROR_CODES.REFRESH_TOKEN_NOT_FOUND) ||
            error.message?.includes(AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN)
        )) ||
        (isAuthError(error) && error.status === 400);

    if (isRefreshTokenError) {
        // Clear auth state
        await store.signOut();

        // Only redirect if not on an auth page
        if (!isAuthPage()) {
            // Store the current path for redirect after login
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname + window.location.search;
                sessionStorage.setItem('auth_redirect', currentPath);
            }

            // Redirect to login with error message
            window.location.href = `/login?error=session_expired`;
        }
        return true;
    }
    return false;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            isAuthenticated: false,
            isEmailVerified: false,
            hasProfile: false,
            isLoading: true,
            error: null,

            initialize: async () => {
                try {
                    // Skip initialization on auth pages
                    if (isAuthPage()) {
                        set({ isLoading: false });
                        return;
                    }

                    const { data: { session: initialSession } } = await supabase.auth.getSession();
                    let currentSession = initialSession;

                    if (currentSession?.user) {
                        // Only refresh if not on auth page and session is expiring soon
                        if (!isAuthPage() && isSessionExpiringSoon(currentSession)) {
                            try {
                                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                                if (!refreshError && refreshData.session) {
                                    currentSession = refreshData.session;
                                }
                            } catch (refreshError) {
                                console.error('Session refresh failed:', refreshError);
                                // Continue with the current session if refresh fails
                            }
                        }

                        const hasProfile = await checkUserProfileExists(currentSession.user.id);
                        const isEmailVerified = !!currentSession.user.email_confirmed_at;

                        if (isEmailVerified) {
                            await updateEmailConfirmedStatus(currentSession.user.id, true);
                        }

                        set({
                            user: currentSession.user,
                            session: currentSession,
                            isAuthenticated: true,
                            isEmailVerified,
                            hasProfile,
                            isLoading: false
                        });
                    } else {
                        set({
                            user: null,
                            session: null,
                            isAuthenticated: false,
                            isEmailVerified: false,
                            hasProfile: false,
                            isLoading: false
                        });
                    }

                    supabase.auth.onAuthStateChange(async (event, session) => {
                        if (event === 'SIGNED_IN' && session?.user) {
                            const hasProfile = await checkUserProfileExists(session.user.id);
                            const isEmailVerified = !!session.user.email_confirmed_at;

                            if (isEmailVerified) {
                                await updateEmailConfirmedStatus(session.user.id, true);
                            }

                            set({
                                user: session.user,
                                session,
                                isAuthenticated: true,
                                isEmailVerified,
                                hasProfile,
                                isLoading: false
                            });
                        } else if (event === 'SIGNED_OUT') {
                            set({
                                user: null,
                                session: null,
                                isAuthenticated: false,
                                isEmailVerified: false,
                                hasProfile: false,
                                isLoading: false
                            });
                        } else if (event === 'TOKEN_REFRESHED' && session) {
                            const currentState = get();
                            set({
                                ...currentState,
                                session,
                                user: session.user
                            });
                        }
                    });
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    set({ isLoading: false, error: 'Failed to initialize authentication' });
                }
            },

            signIn: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) throw error;

                    if (data.user) {
                        try {
                            const hasProfile = await checkUserProfileExists(data.user.id);
                            const isEmailVerified = !!data.user.email_confirmed_at;

                            if (isEmailVerified) {
                                await updateEmailConfirmedStatus(data.user.id, true);
                            }

                            set({
                                user: data.user,
                                session: data.session,
                                isAuthenticated: true,
                                isEmailVerified,
                                hasProfile,
                                isLoading: false
                            });
                        } catch (profileError) {
                            console.error('Error checking profile:', profileError);
                            set({
                                user: data.user,
                                session: data.session,
                                isAuthenticated: true,
                                isEmailVerified: !!data.user.email_confirmed_at,
                                hasProfile: false,
                                isLoading: false
                            });
                        }
                    }
                } catch (error) {
                    handleAuthError(error);
                    set({ isLoading: false, error: 'Failed to sign in' });
                }
            },

            signUp: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                    });

                    if (error) throw error;

                    set({
                        user: data.user,
                        session: data.session,
                        isAuthenticated: true,
                        isEmailVerified: false,
                        hasProfile: false,
                        isLoading: false
                    });
                } catch (error) {
                    handleAuthError(error);
                    set({ isLoading: false, error: 'Failed to sign up' });
                }
            },

            signOut: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;

                    set({
                        user: null,
                        session: null,
                        isAuthenticated: false,
                        isEmailVerified: false,
                        hasProfile: false,
                        isLoading: false
                    });
                } catch (error) {
                    handleAuthError(error);
                    set({ isLoading: false, error: 'Failed to sign out' });
                }
            },

            resetPassword: async (email: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email);
                    if (error) throw error;
                    set({ isLoading: false });
                } catch (error) {
                    handleAuthError(error);
                    set({ isLoading: false, error: 'Failed to reset password' });
                }
            },

            updatePassword: async (password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { error } = await supabase.auth.updateUser({
                        password
                    });
                    if (error) throw error;
                    set({ isLoading: false });
                } catch (error) {
                    handleAuthError(error);
                    set({ isLoading: false, error: 'Failed to update password' });
                }
            },

            refreshSession: async () => {
                // Skip refresh on auth pages
                if (isAuthPage()) return;

                const currentState = get();
                if (!currentState.session) {
                    return; // Don't attempt to refresh if there's no session
                }

                set({ isLoading: true, error: null });
                try {
                    const { data: { session, user }, error } = await supabase.auth.refreshSession();
                    if (error) {
                        const handled = await handleSessionError(error, currentState);
                        if (handled) return;
                        throw error;
                    }

                    if (session && user) {
                        const hasProfile = await checkUserProfileExists(user.id);
                        const isEmailVerified = !!user.email_confirmed_at;

                        if (isEmailVerified) {
                            await updateEmailConfirmedStatus(user.id, true);
                        }

                        set({
                            user,
                            session,
                            isAuthenticated: true,
                            isEmailVerified,
                            hasProfile,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    const handled = await handleSessionError(error, currentState);
                    if (!handled) {
                        handleAuthError(error);
                        set({ isLoading: false, error: 'Failed to refresh session' });
                    }
                }
            },

            setIsEmailVerified: (isVerified: boolean) => {
                set((state) => ({
                    ...state,
                    isEmailVerified: isVerified
                }));
            },

            checkEmailVerification: () => {
                const state = get();
                if (state.user?.email_confirmed_at) {
                    set((state) => ({
                        ...state,
                        isEmailVerified: true
                    }));
                }
            }
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                user: state.user,
                session: state.session,
                isAuthenticated: state.isAuthenticated,
                isEmailVerified: state.isEmailVerified,
                hasProfile: state.hasProfile
            })
        }
    )
);

// Initialize auth only once when the module loads
let isInitialized = false;

export function initializeAuth() {
    if (isInitialized) return;

    const { initialize } = useAuthStore.getState();
    initialize();
    isInitialized = true;
}

// Initialize auth when the app loads
if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
        initializeAuth();
    } else {
        window.addEventListener('load', initializeAuth);
    }
} 