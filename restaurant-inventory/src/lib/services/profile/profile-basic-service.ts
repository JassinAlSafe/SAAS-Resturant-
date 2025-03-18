import { BusinessProfile } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
    BusinessProfileError,
    BusinessProfileDatabase,
    BusinessType
} from "@/lib/types/business-profile";
import {
    getCachedProfile,
    setCachedProfile,
    transformDatabaseResponse,
    transformForDatabase,
    defaultBusinessProfile,
    validateCurrencyCode
} from "@/lib/utils/business-profile-utils";

/**
 * Profile Basic Service
 * Core operations for business profiles (CRUD)
 */
export const profileBasicService = {
    /**
     * Clean up duplicate profiles for a user
     */
    cleanupDuplicateProfiles: async (userId: string): Promise<void> => {
        try {
            console.log("Cleaning up duplicate profiles for user:", userId);

            // First get all profiles for this user
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching profiles for cleanup:', fetchError);
                return;
            }

            console.log(`Found ${profiles?.length || 0} profiles for user ${userId}`);

            // Keep the most recent one and delete the rest
            if (profiles && profiles.length > 1) {
                const mostRecentId = profiles[0].id;
                const idsToDelete = profiles.slice(1).map(p => p.id);

                console.log(`Keeping most recent profile ${mostRecentId}, deleting ${idsToDelete.length} older profiles`);

                const { error: deleteError } = await supabase
                    .from('business_profiles')
                    .delete()
                    .in('id', idsToDelete);

                if (deleteError) {
                    console.error('Error deleting duplicate profiles:', deleteError);
                } else {
                    console.log(`Successfully deleted ${idsToDelete.length} duplicate profiles`);
                }
            }
        } catch (error) {
            console.error('Error cleaning up duplicate profiles:', error);
        }
    },

    /**
     * Get the most recent business profile for a user
     */
    getBusinessProfile: async (userId: string): Promise<BusinessProfile> => {
        try {
            console.log("Fetching business profile for user:", userId);

            // Check cache first
            const cachedProfile = getCachedProfile(userId);
            if (cachedProfile) {
                console.log("Using cached profile");
                return cachedProfile;
            }

            const { data: profiles, error } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (!error && profiles && profiles.length > 0) {
                const profile = transformDatabaseResponse(profiles[0] as BusinessProfileDatabase);
                setCachedProfile(userId, profile);
                console.log("Successfully fetched profile from business_profiles");
                return profile;
            }

            // If no profile found, create a new one
            console.log("No profile found, creating new one");
            const newProfile = await profileBasicService.createBusinessProfile(userId);
            setCachedProfile(userId, newProfile);
            return newProfile;
        } catch (error) {
            console.error('Error in getBusinessProfile:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to fetch or create business profile',
                    'PROFILE_FETCH_ERROR'
                );
        }
    },

    /**
     * Create a new business profile for a user
     */
    createBusinessProfile: async (userId: string): Promise<BusinessProfile> => {
        try {
            console.log("Creating new business profile for user:", userId);

            const initialProfile = {
                user_id: userId,
                name: "My Restaurant",
                type: BusinessType.CASUAL_DINING,
                operating_hours: defaultBusinessProfile.operatingHours,
                default_currency: defaultBusinessProfile.defaultCurrency,
                tax_enabled: false,
                tax_rate: 0,
                tax_name: "Sales Tax"
            };

            const { data, error } = await supabase
                .from('business_profiles')
                .insert(initialProfile)
                .select()
                .single();

            if (error) {
                console.error('Profile creation failed:', error);
                throw new BusinessProfileError(
                    `Failed to create business profile: ${error.message}`,
                    'PROFILE_CREATE_ERROR'
                );
            }

            if (!data) {
                throw new BusinessProfileError(
                    "No data returned from profile creation",
                    'PROFILE_CREATE_ERROR'
                );
            }

            console.log("Successfully created business profile");
            return transformDatabaseResponse(data as BusinessProfileDatabase);
        } catch (error) {
            console.error('Error in createBusinessProfile:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to create business profile',
                    'PROFILE_CREATE_ERROR'
                );
        }
    },

    /**
     * Update a business profile
     */
    updateBusinessProfile: async (
        profileId: string,
        profileData: Partial<Omit<BusinessProfile, "id" | "createdAt" | "updatedAt">>
    ): Promise<BusinessProfile> => {
        try {
            console.log("Updating business profile with ID:", profileId);
            console.log("Update data:", profileData);

            // Prepare the update data
            const updates = {
                ...transformForDatabase(profileData),
                updated_at: new Date().toISOString(),
            };

            // Update the profile using its ID
            const { data, error } = await supabase
                .from('business_profiles')
                .update(updates)
                .eq('id', profileId)
                .select()
                .single();

            if (error) {
                console.error('Error updating profile:', error);
                throw new BusinessProfileError(
                    `Failed to update business profile: ${error.message}`,
                    'PROFILE_UPDATE_ERROR'
                );
            }

            console.log("Successfully updated profile:", data);
            const transformedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);

            // Update cache if we have the user_id
            if (data.user_id) {
                setCachedProfile(data.user_id, transformedProfile);
            }

            return transformedProfile;
        } catch (error) {
            console.error('Error in updateBusinessProfile:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to update business profile',
                    'PROFILE_UPDATE_ERROR'
                );
        }
    },

    /**
     * Update default currency for a business profile
     */
    updateDefaultCurrency: async (
        profileId: string,
        currency: string
    ): Promise<BusinessProfile> => {
        try {
            console.log("Updating default currency for profile:", profileId);
            console.log("New currency:", currency);

            // Validate currency
            if (!validateCurrencyCode(currency)) {
                throw new BusinessProfileError(
                    `Invalid currency code: ${currency}. Please use a valid ISO currency code.`,
                    'INVALID_CURRENCY'
                );
            }

            const updates = {
                default_currency: currency,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('business_profiles')
                .update(updates)
                .eq('id', profileId)
                .select()
                .single();

            if (error) {
                console.error('Error updating currency:', error);
                throw new BusinessProfileError(
                    `Failed to update default currency: ${error.message}`,
                    'CURRENCY_UPDATE_ERROR'
                );
            }

            console.log("Successfully updated currency:", data);
            const transformedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);

            // Update cache if we have the user_id
            if (data.user_id) {
                setCachedProfile(data.user_id, transformedProfile);
            }

            return transformedProfile;
        } catch (error) {
            console.error('Error in updateDefaultCurrency:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to update default currency',
                    'CURRENCY_UPDATE_ERROR'
                );
        }
    }
}; 