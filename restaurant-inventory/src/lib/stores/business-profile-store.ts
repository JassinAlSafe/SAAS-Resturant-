import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type BusinessProfile } from "@/lib/services/business-profile-service";
import {
    getBusinessProfiles,
    getBusinessProfileById,
    createBusinessProfile,
    updateBusinessProfile,
    deleteBusinessProfile
} from "@/lib/services/business-profile-service";

interface BusinessProfileState {
    businessProfiles: BusinessProfile[];
    currentBusinessProfile: BusinessProfile | null;
    isLoading: boolean;
    error: string | null;
}

interface BusinessProfileStore extends BusinessProfileState {
    fetchProfiles: (userId: string) => Promise<void>;
    setCurrentProfile: (profile: BusinessProfile | null) => void;
    createProfile: (userId: string, profile: Omit<BusinessProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>) => Promise<void>;
    updateProfile: (profileId: string, updates: Partial<Omit<BusinessProfile, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
}

export const useBusinessProfileStore = create<BusinessProfileStore>()(
    persist(
        (set, get) => ({
            businessProfiles: [],
            currentBusinessProfile: null,
            isLoading: false,
            error: null,

            fetchProfiles: async (userId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const profiles = await getBusinessProfiles(userId);
                    set({
                        businessProfiles: profiles,
                        currentBusinessProfile: profiles.length > 0 ? profiles[0] : null,
                        isLoading: false
                    });
                } catch (error) {
                    console.error('Error fetching business profiles:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to fetch business profiles'
                    });
                }
            },

            setCurrentProfile: (profile: BusinessProfile | null) => {
                set({ currentBusinessProfile: profile });
            },

            createProfile: async (userId: string, profile) => {
                set({ isLoading: true, error: null });
                try {
                    const newProfile = await createBusinessProfile(userId, profile);
                    if (newProfile) {
                        const profiles = [...get().businessProfiles, newProfile];
                        set({
                            businessProfiles: profiles,
                            currentBusinessProfile: newProfile,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Error creating business profile:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to create business profile'
                    });
                }
            },

            updateProfile: async (profileId: string, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedProfile = await updateBusinessProfile(profileId, updates);
                    if (updatedProfile) {
                        const profiles = get().businessProfiles.map(p =>
                            p.id === profileId ? updatedProfile : p
                        );
                        set({
                            businessProfiles: profiles,
                            currentBusinessProfile: get().currentBusinessProfile?.id === profileId
                                ? updatedProfile
                                : get().currentBusinessProfile,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Error updating business profile:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to update business profile'
                    });
                }
            },

            deleteProfile: async (profileId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const success = await deleteBusinessProfile(profileId);
                    if (success) {
                        const profiles = get().businessProfiles.filter(p => p.id !== profileId);
                        set({
                            businessProfiles: profiles,
                            currentBusinessProfile: get().currentBusinessProfile?.id === profileId
                                ? (profiles.length > 0 ? profiles[0] : null)
                                : get().currentBusinessProfile,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Error deleting business profile:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to delete business profile'
                    });
                }
            }
        }),
        {
            name: 'business-profile-store',
            partialize: (state) => ({
                businessProfiles: state.businessProfiles,
                currentBusinessProfile: state.currentBusinessProfile
            })
        }
    )
); 