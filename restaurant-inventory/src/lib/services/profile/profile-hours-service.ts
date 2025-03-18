import { BusinessProfile } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
    BusinessProfileError,
    BusinessProfileDatabase,
    DayOfWeek,
    PartialOperatingHours
} from "@/lib/types/business-profile";
import {
    transformDatabaseResponse,
    setCachedProfile
} from "@/lib/utils/business-profile-utils";

/**
 * Profile Hours Service
 * Operations for managing business operating hours
 */
export const profileHoursService = {
    /**
     * Validate operating hours format
     */
    validateOperatingHours: (hours: { open: string; close: string; closed: boolean }): { valid: boolean; error?: string } => {
        // If the day is marked as closed, no need to validate times
        if (hours.closed) {
            return { valid: true };
        }

        // Check for 24-hour open flag
        if (hours.open === "24hours" && hours.close === "24hours") {
            return { valid: true };
        }

        // Validate time format (HH:MM in 24-hour format)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(hours.open)) {
            return {
                valid: false,
                error: `Invalid opening time format: ${hours.open}. Use HH:MM in 24-hour format.`
            };
        }

        if (!timeRegex.test(hours.close)) {
            return {
                valid: false,
                error: `Invalid closing time format: ${hours.close}. Use HH:MM in 24-hour format.`
            };
        }

        // Overnight hours are allowed (we don't enforce open < close)
        return { valid: true };
    },

    /**
     * Update operating hours for a single day
     */
    updateOperatingHours: async (
        userId: string,
        day: DayOfWeek,
        hours: { open: string; close: string; closed: boolean }
    ): Promise<BusinessProfile> => {
        try {
            // Validate the hours unless marked as closed
            if (!hours.closed) {
                const validation = profileHoursService.validateOperatingHours(hours);
                if (!validation.valid) {
                    throw new BusinessProfileError(
                        validation.error || "Invalid operating hours",
                        'INVALID_HOURS'
                    );
                }
            }

            // First get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, operating_hours')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new BusinessProfileError(
                    `No profile found for user ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }

            const profile = profiles[0];

            // Update the operating hours for the specified day
            const updatedHours = {
                ...profile.operating_hours,
                [day]: hours
            };

            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    operating_hours: updatedHours,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating hours:', error);
                throw new BusinessProfileError(
                    `Failed to update operating hours: ${error.message}`,
                    'HOURS_UPDATE_ERROR'
                );
            }

            const transformedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);
            setCachedProfile(userId, transformedProfile);
            return transformedProfile;
        } catch (error) {
            console.error('Error updating operating hours:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to update operating hours',
                    'HOURS_UPDATE_ERROR'
                );
        }
    },

    /**
     * Update multiple days' operating hours at once
     */
    updateMultipleDaysHours: async (
        userId: string,
        updates: PartialOperatingHours
    ): Promise<BusinessProfile> => {
        try {
            // Validate all updates
            for (const [day, hours] of Object.entries(updates)) {
                if (!hours) continue;
                if (!hours.closed) {
                    const validation = profileHoursService.validateOperatingHours(hours);
                    if (!validation.valid) {
                        throw new BusinessProfileError(
                            `${day}: ${validation.error || "Invalid operating hours"}`,
                            'INVALID_HOURS'
                        );
                    }
                }
            }

            // Get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, operating_hours')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new BusinessProfileError(
                    `No profile found for user ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }

            const profile = profiles[0];

            // Update all specified days
            const updatedHours = {
                ...profile.operating_hours,
                ...updates
            };

            console.log(`Updating operating hours for ${Object.keys(updates).length} days`);

            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    operating_hours: updatedHours,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating multiple days:', error);
                throw new BusinessProfileError(
                    `Failed to update operating hours: ${error.message}`,
                    'HOURS_UPDATE_ERROR'
                );
            }

            const transformedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);
            setCachedProfile(userId, transformedProfile);
            return transformedProfile;
        } catch (error) {
            console.error('Error updating multiple days operating hours:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to update operating hours',
                    'HOURS_UPDATE_ERROR'
                );
        }
    },

    /**
     * Set all days to the same operating hours
     */
    setAllDaysOperatingHours: async (
        userId: string,
        hours: { open: string; close: string; closed: boolean }
    ): Promise<BusinessProfile> => {
        try {
            // Validate the hours
            if (!hours.closed) {
                const validation = profileHoursService.validateOperatingHours(hours);
                if (!validation.valid) {
                    throw new BusinessProfileError(
                        validation.error || "Invalid operating hours",
                        'INVALID_HOURS'
                    );
                }
            }

            // Create an update object for all days
            const allDaysUpdate = {
                monday: hours,
                tuesday: hours,
                wednesday: hours,
                thursday: hours,
                friday: hours,
                saturday: hours,
                sunday: hours
            };

            // Use the batch update method
            return profileHoursService.updateMultipleDaysHours(userId, allDaysUpdate);
        } catch (error) {
            console.error('Error setting all days operating hours:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to set all days operating hours',
                    'HOURS_UPDATE_ERROR'
                );
        }
    },

    /**
     * Copy operating hours from one day to others
     */
    copyOperatingHours: async (
        userId: string,
        sourceDay: DayOfWeek,
        targetDays: DayOfWeek[]
    ): Promise<BusinessProfile> => {
        try {
            // Get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, operating_hours')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new BusinessProfileError(
                    `No profile found for user ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }

            const profile = profiles[0];

            // Get source day hours
            const sourceHours = profile.operating_hours[sourceDay];
            if (!sourceHours) {
                throw new BusinessProfileError(
                    `Source day ${sourceDay} not found in operating hours`,
                    'INVALID_SOURCE_DAY'
                );
            }

            // Create update object for target days
            const updates: PartialOperatingHours = {};
            for (const day of targetDays) {
                updates[day] = { ...sourceHours };
            }

            console.log(`Copying hours from ${sourceDay} to ${targetDays.length} days`);

            // Use the batch update method
            return profileHoursService.updateMultipleDaysHours(userId, updates);
        } catch (error) {
            console.error('Error copying operating hours:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to copy operating hours',
                    'HOURS_UPDATE_ERROR'
                );
        }
    }
}; 