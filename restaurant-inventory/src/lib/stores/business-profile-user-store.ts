import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    type BusinessProfileUser,
    checkBusinessProfileAccess,
    getBusinessProfileUsers,
    addUserToBusinessProfile,
    updateUserRole,
    removeUserFromBusinessProfile,
    createBusinessProfileWithUser
} from "@/lib/services/business-profile-user-service";

interface BusinessProfileUserState {
    businessProfileUsers: BusinessProfileUser[];
    hasBusinessProfileAccess: boolean;
    userBusinessProfileRoles: { business_profile_id: string; role: string }[];
    isLoading: boolean;
    error: string | null;
}

interface BusinessProfileUserStore extends BusinessProfileUserState {
    checkAccess: (userId: string) => Promise<void>;
    fetchProfileUsers: (businessProfileId: string) => Promise<void>;
    addUserToProfile: (businessProfileId: string, userId: string, role: 'owner' | 'manager' | 'staff') => Promise<void>;
    updateRole: (businessProfileId: string, userId: string, role: 'owner' | 'manager' | 'staff') => Promise<void>;
    removeUser: (businessProfileId: string, userId: string) => Promise<void>;
    createProfileWithUser: (userId: string, profileData: any) => Promise<string | null>;
}

export const useBusinessProfileUserStore = create<BusinessProfileUserStore>()(
    persist(
        (set, get) => ({
            businessProfileUsers: [],
            hasBusinessProfileAccess: false,
            userBusinessProfileRoles: [],
            isLoading: false,
            error: null,

            checkAccess: async (userId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { hasAccess, profiles } = await checkBusinessProfileAccess(userId);
                    set({
                        hasBusinessProfileAccess: hasAccess,
                        userBusinessProfileRoles: profiles,
                        isLoading: false
                    });
                } catch (error) {
                    console.error('Error checking business profile access:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to check business profile access'
                    });
                }
            },

            fetchProfileUsers: async (businessProfileId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const users = await getBusinessProfileUsers(businessProfileId);
                    set({
                        businessProfileUsers: users,
                        isLoading: false
                    });
                } catch (error) {
                    console.error('Error fetching business profile users:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to fetch business profile users'
                    });
                }
            },

            addUserToProfile: async (businessProfileId: string, userId: string, role: 'owner' | 'manager' | 'staff') => {
                set({ isLoading: true, error: null });
                try {
                    const result = await addUserToBusinessProfile(businessProfileId, userId, role);
                    if (result) {
                        // Refresh the user list
                        await get().fetchProfileUsers(businessProfileId);
                    }
                    set({ isLoading: false });
                } catch (error) {
                    console.error('Error adding user to business profile:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to add user to business profile'
                    });
                }
            },

            updateRole: async (businessProfileId: string, userId: string, role: 'owner' | 'manager' | 'staff') => {
                set({ isLoading: true, error: null });
                try {
                    const result = await updateUserRole(businessProfileId, userId, role);
                    if (result) {
                        // Update the local user list
                        const updatedUsers = get().businessProfileUsers.map(user =>
                            user.user_id === userId && user.business_profile_id === businessProfileId
                                ? { ...user, role }
                                : user
                        );
                        set({
                            businessProfileUsers: updatedUsers,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Error updating user role:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to update user role'
                    });
                }
            },

            removeUser: async (businessProfileId: string, userId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const success = await removeUserFromBusinessProfile(businessProfileId, userId);
                    if (success) {
                        // Update the local user list
                        const updatedUsers = get().businessProfileUsers.filter(user =>
                            !(user.user_id === userId && user.business_profile_id === businessProfileId)
                        );
                        set({
                            businessProfileUsers: updatedUsers,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Error removing user from business profile:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to remove user from business profile'
                    });
                }
            },

            createProfileWithUser: async (userId: string, profileData: any) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await createBusinessProfileWithUser(userId, profileData);
                    set({ isLoading: false });

                    if (result?.id) {
                        // Update access status after creating a profile
                        await get().checkAccess(userId);
                        return result.id;
                    }
                    return null;
                } catch (error) {
                    console.error('Error creating business profile with user:', error);
                    set({
                        isLoading: false,
                        error: 'Failed to create business profile'
                    });
                    return null;
                }
            }
        }),
        {
            name: 'business-profile-user-store',
            partialize: (state) => ({
                hasBusinessProfileAccess: state.hasBusinessProfileAccess,
                userBusinessProfileRoles: state.userBusinessProfileRoles
            })
        }
    )
); 