import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useBusinessProfileStore } from '@/lib/stores/business-profile-store';

export function useAuthBusiness() {
    const {
        user,
        session,
        isAuthenticated,
        isEmailVerified,
        hasProfile,
        isLoading: isAuthLoading,
        error: authError,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshSession
    } = useAuthStore();

    const {
        businessProfiles,
        currentBusinessProfile,
        isLoading: isBusinessLoading,
        error: businessError,
        fetchProfiles,
        setCurrentProfile,
        createProfile,
        updateProfile,
        deleteProfile
    } = useBusinessProfileStore();

    // Fetch business profiles when user is authenticated and has a profile
    useEffect(() => {
        if (isAuthenticated && hasProfile && user) {
            fetchProfiles(user.id);
        }
    }, [isAuthenticated, hasProfile, user, fetchProfiles]);

    return {
        // Auth state
        user,
        session,
        isAuthenticated,
        isEmailVerified,
        hasProfile,
        isAuthLoading,
        authError,

        // Auth actions
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshSession,

        // Business profile state
        businessProfiles,
        currentBusinessProfile,
        isBusinessLoading,
        businessError,

        // Business profile actions
        setCurrentProfile,
        createProfile,
        updateProfile,
        deleteProfile,

        // Combined loading state
        isLoading: isAuthLoading || isBusinessLoading
    };
} 