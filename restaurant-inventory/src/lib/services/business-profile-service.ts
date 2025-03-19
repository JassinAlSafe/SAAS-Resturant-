import { secureApiCall } from '@/lib/api/secure-client';
import { supabase } from '@/lib/supabase';
import {
    type BusinessProfile,
    type BusinessType,
    type OperatingHours,
    type CurrencyCode
} from '@/lib/types/business-profile';
import { BusinessProfileError } from "@/lib/types/business-profile";
import { profileBasicService } from "./profile/profile-basic-service";
import { profileTaxService } from "./profile/profile-tax-service";
import { profileHoursService } from "./profile/profile-hours-service";
import { profileMediaService } from "./profile/profile-media-service";

interface DatabaseBusinessProfile {
    id: string;
    name: string;
    type: BusinessType;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    logo: string | null;
    operating_hours: OperatingHours;
    default_currency: CurrencyCode;
    tax_rate: number;
    tax_enabled: boolean;
    tax_name: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    subscription_plan: 'free' | 'pro' | 'enterprise';
    subscription_status: 'active' | 'inactive' | 'cancelled';
    max_users: number;
}

// Helper function to safely transform database response
function safeTransformDatabaseResponse(data: unknown): DatabaseBusinessProfile {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid database response');
    }

    const record = data as Record<string, unknown>;

    return {
        id: String(record.id),
        name: String(record.name),
        type: record.type as BusinessType,
        email: record.email as string | null,
        phone: record.phone as string | null,
        website: record.website as string | null,
        address: record.address as string | null,
        city: record.city as string | null,
        state: record.state as string | null,
        zip_code: record.zip_code as string | null,
        country: record.country as string | null,
        logo: record.logo as string | null,
        operating_hours: record.operating_hours as OperatingHours,
        default_currency: record.default_currency as CurrencyCode,
        tax_rate: Number(record.tax_rate),
        tax_enabled: Boolean(record.tax_enabled),
        tax_name: String(record.tax_name),
        created_at: String(record.created_at),
        updated_at: String(record.updated_at),
        user_id: String(record.user_id),
        subscription_plan: record.subscription_plan as 'free' | 'pro' | 'enterprise',
        subscription_status: record.subscription_status as 'active' | 'inactive' | 'cancelled',
        max_users: Number(record.max_users)
    };
}

// Helper function to transform database response to BusinessProfile type
function transformDatabaseResponse(data: DatabaseBusinessProfile): BusinessProfile {
    return {
        id: data.id,
        name: data.name,
        type: data.type,
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip_code || '',
        country: data.country || '',
        logo: data.logo,
        operatingHours: data.operating_hours,
        defaultCurrency: data.default_currency,
        taxRate: data.tax_rate,
        taxEnabled: data.tax_enabled,
        taxName: data.tax_name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        subscriptionPlan: data.subscription_plan || 'free',
        subscriptionStatus: data.subscription_status || 'active',
        maxUsers: data.max_users || 5
    };
}

// Helper function to transform BusinessProfile to database format
function transformForDatabase(data: Partial<BusinessProfile>): Partial<DatabaseBusinessProfile> {
    const result: Partial<DatabaseBusinessProfile> = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.type !== undefined) result.type = data.type;
    if (data.email !== undefined) result.email = data.email || null;
    if (data.phone !== undefined) result.phone = data.phone || null;
    if (data.website !== undefined) result.website = data.website || null;
    if (data.address !== undefined) result.address = data.address || null;
    if (data.city !== undefined) result.city = data.city || null;
    if (data.state !== undefined) result.state = data.state || null;
    if (data.zipCode !== undefined) result.zip_code = data.zipCode || null;
    if (data.country !== undefined) result.country = data.country || null;
    if (data.logo !== undefined) result.logo = data.logo;
    if (data.operatingHours !== undefined) result.operating_hours = data.operatingHours;
    if (data.defaultCurrency !== undefined) result.default_currency = data.defaultCurrency;
    if (data.taxEnabled !== undefined) result.tax_enabled = data.taxEnabled;
    if (data.taxRate !== undefined) result.tax_rate = data.taxRate;
    if (data.taxName !== undefined) result.tax_name = data.taxName;

    return result;
}

/**
 * Get all business profiles for a user
 */
export async function getBusinessProfiles(userId: string): Promise<BusinessProfile[]> {
    return secureApiCall(async () => {
        const { data, error } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data) return [];

        return data.map(profile => transformDatabaseResponse(safeTransformDatabaseResponse(profile)));
    });
}

/**
 * Get a single business profile by ID
 */
export async function getBusinessProfileById(profileId: string): Promise<BusinessProfile> {
    return secureApiCall(async () => {
        const { data, error } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Profile not found');

        return transformDatabaseResponse(safeTransformDatabaseResponse(data));
    });
}

/**
 * Get the business profile for a user
 */
export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
    return secureApiCall(async () => {
        if (!userId) {
            console.error('getBusinessProfile called with invalid userId:', userId);
            return null;
        }

        console.log(`Attempting to fetch business profile for user: ${userId}`);

        // First try to get the business profile through the join table
        try {
            const { data: joinData, error: joinError } = await supabase
                .from('business_profile_users')
                .select(`
                    business_profiles (*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!joinError && joinData?.business_profiles) {
                console.log('Found business profile via join table, raw data:', joinData.business_profiles);
                const transformedProfile = transformDatabaseResponse(safeTransformDatabaseResponse(joinData.business_profiles));
                console.log('Transformed profile:', {
                    id: transformedProfile.id,
                    name: transformedProfile.name,
                    subscriptionPlan: transformedProfile.subscriptionPlan,
                    subscriptionStatus: transformedProfile.subscriptionStatus,
                    maxUsers: transformedProfile.maxUsers
                });
                return transformedProfile;
            }
            console.warn('No profile found in join table, trying direct query');
        } catch (error) {
            console.warn('Join table query failed, falling back to direct query:', error);
        }

        // If join table approach fails, try direct query to business_profiles
        try {
            const { data: profiles, error: profileError } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (!profileError && profiles && profiles.length > 0) {
                console.log('Found business profile via direct query, raw data:', profiles[0]);
                const transformedProfile = transformDatabaseResponse(safeTransformDatabaseResponse(profiles[0]));
                console.log('Transformed profile:', {
                    id: transformedProfile.id,
                    name: transformedProfile.name,
                    subscriptionPlan: transformedProfile.subscriptionPlan,
                    subscriptionStatus: transformedProfile.subscriptionStatus,
                    maxUsers: transformedProfile.maxUsers
                });
                return transformedProfile;
            }
            console.warn('No business profile found in either table');
            return null;
        } catch (error) {
            console.error('Error in direct profile query:', error);
            return null;
        }
    });
}

/**
 * Create a new business profile
 */
export async function createBusinessProfile(
    userId: string,
    profile: Omit<BusinessProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<BusinessProfile> {
    return secureApiCall(async () => {
        const dbProfile = transformForDatabase(profile);
        const { data, error } = await supabase
            .from('business_profiles')
            .insert({
                ...dbProfile,
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Failed to create profile');

        return transformDatabaseResponse(safeTransformDatabaseResponse(data));
    });
}

/**
 * Update a business profile
 */
export async function updateBusinessProfile(
    profileId: string,
    updates: Partial<BusinessProfile>
): Promise<BusinessProfile> {
    return secureApiCall(async () => {
        const dbUpdates = transformForDatabase(updates);
        const { data, error } = await supabase
            .from('business_profiles')
            .update({
                ...dbUpdates,
                updated_at: new Date().toISOString()
            })
            .eq('id', profileId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Failed to update profile');

        return transformDatabaseResponse(safeTransformDatabaseResponse(data));
    });
}

/**
 * Delete a business profile
 */
export async function deleteBusinessProfile(profileId: string): Promise<void> {
    return secureApiCall(async () => {
        const { error } = await supabase
            .from('business_profiles')
            .delete()
            .eq('id', profileId);

        if (error) throw error;
    });
}

/**
 * Unified Business Profile Service
 * This is the main entry point for all business profile operations
 */
export const businessProfileService = {
    /**
     * Get a business profile by user ID
     */
    getBusinessProfile: async (userId: string): Promise<BusinessProfile> => {
        try {
            console.log(`Business profile service: fetching profile for user ${userId}`);
            const profile = await profileBasicService.getBusinessProfile(userId);

            // Log the profile for debugging
            console.log("Profile retrieved from basic service:", {
                id: profile?.id,
                name: profile?.name,
                hasOperatingHours: !!profile?.operatingHours,
                hasTaxSettings: !!profile?.taxSettings
            });

            if (!profile || !profile.id) {
                throw new BusinessProfileError("No valid profile returned from basic service", "PROFILE_FETCH_ERROR");
            }

            return profile;
        } catch (error) {
            console.error("Error in business profile service:", error);
            if (error instanceof BusinessProfileError) {
                throw error;
            }
            throw new BusinessProfileError(
                `Failed to get business profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'PROFILE_FETCH_ERROR'
            );
        }
    },

    /**
     * Create a new business profile
     */
    createBusinessProfile: async (
        userId: string,
        profileData: Partial<BusinessProfile>
    ): Promise<BusinessProfile> => {
        try {
            console.log(`Creating business profile for user ${userId}`);

            // Add detailed logging for debugging
            console.log("Profile data received:", {
                name: profileData?.name,
                type: profileData?.type,
                taxEnabled: profileData?.taxEnabled,
                taxRate: profileData?.taxRate,
                taxName: profileData?.taxName
            });

            // Skip the RPC method as it appears to be missing
            console.log("Skipping RPC method - using direct profile creation");

            try {
                return await profileBasicService.createBusinessProfile(userId, profileData?.email);
            } catch (basicServiceError) {
                console.error("Profile creation method failed:", basicServiceError);

                // Try the direct API function as the last resort
                try {
                    const result = await createBusinessProfile(userId, {
                        name: profileData?.name || "My Restaurant",
                        type: profileData?.type || BusinessType.CASUAL_DINING,
                        taxEnabled: profileData?.taxEnabled || false,
                        taxRate: profileData?.taxRate || 0,
                        taxName: profileData?.taxName || "Sales Tax"
                    });
                    console.log("Created profile through direct API function");
                    return result;
                } catch (directError) {
                    console.error("All creation methods failed:", directError);
                    throw new BusinessProfileError(
                        'All profile creation methods failed, please try again later',
                        'PROFILE_CREATE_CRITICAL_ERROR'
                    );
                }
            }
        } catch (error) {
            console.error("Error creating business profile:", error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    `Failed to create business profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    'PROFILE_CREATE_ERROR'
                );
        }
    },

    /**
     * Update a business profile
     */
    updateBusinessProfile: async (
        profileId: string,
        updates: Partial<BusinessProfile>
    ): Promise<BusinessProfile> => {
        try {
            return await profileBasicService.updateBusinessProfile(profileId, updates);
        } catch (error) {
            console.error("Error updating business profile:", error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to update business profile',
                    'PROFILE_UPDATE_ERROR'
                );
        }
    },

    /**
     * Re-export additional services for convenience
     */
    tax: profileTaxService,
    hours: profileHoursService,
    media: profileMediaService,
};