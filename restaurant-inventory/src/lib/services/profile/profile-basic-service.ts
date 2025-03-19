import { BusinessProfile, BusinessProfileDatabase, BusinessType, CurrencyCode } from "@/lib/types/business-profile";
import { supabase, withAuthenticatedSupabase } from "@/lib/supabase";
import { BusinessProfileError } from "@/lib/types/business-profile";
import {
    getCachedProfile,
    setCachedProfile,
    transformDatabaseResponse,
    transformForDatabase,
    defaultBusinessProfile,
    validateCurrencyCode
} from "@/lib/utils/business-profile-utils";
import { businessProfileUserService } from "@/lib/services/business-profile-user-service";

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

            // First get all profiles for this user using authenticated client
            await withAuthenticatedSupabase(async (client) => {
                const { data: profiles, error: fetchError } = await client
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

                    const { error: deleteError } = await client
                        .from('business_profiles')
                        .delete()
                        .in('id', idsToDelete);

                    if (deleteError) {
                        console.error('Error deleting duplicate profiles:', deleteError);
                    } else {
                        console.log(`Successfully deleted ${ idsToDelete.length } duplicate profiles`);
                    }
                }
            });
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

            // Use authenticated client to fetch profiles
            return await withAuthenticatedSupabase(async (client) => {
                // First try to get from business_profile_users table
                const { data: joinProfiles, error: joinError } = await client
                    .from('business_profile_users')
                    .select('business_profiles (*)')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (!joinError && joinProfiles && joinProfiles.length > 0 && joinProfiles[0].business_profiles) {
                    const profile = transformDatabaseResponse(joinProfiles[0].business_profiles as unknown as BusinessProfileDatabase);
                    setCachedProfile(userId, profile);
                    console.log("Successfully fetched profile from join table");
                    return profile;
                }

                // If join table fails, try direct query
                const { data: directProfiles, error: directError } = await client
                    .from('business_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (!directError && directProfiles && directProfiles.length > 0) {
                    const profile = transformDatabaseResponse(directProfiles[0] as BusinessProfileDatabase);
                    setCachedProfile(userId, profile);
                    console.log("Successfully fetched profile from direct query");
                    return profile;
                }

                // Check if this is during login before creating a new profile
                const isRecentLogin = () => {
                    const loginTimestamp = sessionStorage.getItem("loginTimestamp");
                    if (!loginTimestamp) return false;
                    const loginTime = parseInt(loginTimestamp, 10);
                    return Date.now() - loginTime < 5000; // Within 5 seconds
                };

                // Don't automatically create during login - return null instead
                if (isRecentLogin()) {
                    console.log("Recent login detected, not creating profile automatically");
                    throw new BusinessProfileError(
                        "No existing profile found during login",
                        "PROFILE_NOT_FOUND"
                    );
                }

                // If no profile found and not during login, create a new one
                console.log("No profile found, creating new one");
                const { data: userData } = await client.auth.getUser();
                const newProfile = await profileBasicService.createBusinessProfile(userId, userData?.user?.email);
                setCachedProfile(userId, newProfile);
                return newProfile;
            });
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
    createBusinessProfile: async (userId: string, userEmail?: string | null): Promise<BusinessProfile> => {
        try {
            console.log("Creating new business profile for user:", userId);

            const initialProfile = {
                user_id: userId,
                name: "My Restaurant",
                type: BusinessType.CASUAL_DINING,
                email: userEmail || "",
                phone: "",
                website: "",
                address: "",
                city: "",
                state: "",
                zip_code: "",
                country: "",
                logo: null,
                operating_hours: defaultBusinessProfile.operatingHours,
                default_currency: CurrencyCode.USD,
                tax_enabled: false,
                tax_rate: 0,
                tax_name: "Sales Tax",
                subscription_plan: "free" as const,
                subscription_status: "active" as const,
                max_users: 5
            };

            // Try direct insertion first - RPC function appears to be missing
            console.log("Attempting direct profile creation...");

            try {
                // Use authenticated supabase client
                return await withAuthenticatedSupabase(async (client) => {
                    const { data, error } = await client
                        .from('business_profiles')
                        .insert(initialProfile)
                        .select()
                        .single();

                    if (error) {
                        console.error('Profile creation failed with auth client:', error);
                        throw new BusinessProfileError(
                            `Failed to create business profile: ${ error.message }`,
                            'PROFILE_CREATE_ERROR'
                        );
                    }

                    if (!data) {
                        throw new BusinessProfileError(
                            "No data returned from profile creation",
                            'PROFILE_CREATE_ERROR'
                        );
                    }

                    console.log("Successfully created business profile with auth client");

                    // Create the join table entry
                    try {
                        const { error: joinError } = await client
                            .from('business_profile_users')
                            .insert({
                                user_id: userId,
                                business_profile_id: data.id,
                                role: 'owner',
                                is_active: true
                            });

                        if (joinError) {
                            console.error('Join table entry creation failed:', joinError);
                        }
                    } catch (joinError) {
                        console.error('Error creating join table entry:', joinError);
                        // Non-fatal error, continue
                    }

                    return transformDatabaseResponse(data as BusinessProfileDatabase);
                });
            } catch (authError) {
                console.error("Failed to create profile with auth client, trying direct method:", authError);

                // Fallback to direct client
                const { data, error } = await supabase
                    .from('business_profiles')
                    .insert(initialProfile)
                    .select()
                    .single();

                if (error) {
                    console.error('Profile creation failed with direct client:', error);
                    throw new BusinessProfileError(
                        `Failed to create business profile: ${ error.message }`,
                        'PROFILE_CREATE_ERROR'
                    );
                }

                if (!data) {
                    throw new BusinessProfileError(
                        "No data returned from direct profile creation",
                        'PROFILE_CREATE_ERROR'
                    );
                }

                console.log("Successfully created business profile with direct client");

                // Try to create join table entry with direct client
                try {
                    const { error: joinError } = await supabase
                        .from('business_profile_users')
                        .insert({
                            user_id: userId,
                            business_profile_id: data.id,
                            role: 'owner',
                            is_active: true
                        });

                    if (joinError) {
                        console.error('Join table entry creation failed (direct):', joinError);
                    }
                } catch (joinError) {
                    console.error('Error creating join table entry (direct):', joinError);
                    // Non-fatal error, continue
                }

                return transformDatabaseResponse(data as BusinessProfileDatabase);
            }
        } catch (error) {
            console.error('Error in createBusinessProfile:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    `Failed to create business profile: ${ error instanceof Error ? error.message : 'Unknown error' }`,
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

            // Use authenticated client to update profile
            return await withAuthenticatedSupabase(async (client) => {
                // Update the profile using its ID
                const { data, error } = await client
                    .from('business_profiles')
                    .update(updates)
                    .eq('id', profileId)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating profile:', error);
                    throw new BusinessProfileError(
                        `Failed to update business profile: ${ error.message }`,
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
            });
        } catch (error) {
            console.error('Error updating business profile:', error);
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
                    `Invalid currency code: ${ currency }.Please use a valid ISO currency code.`,
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
                    `Failed to update default currency: ${ error.message }`,
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