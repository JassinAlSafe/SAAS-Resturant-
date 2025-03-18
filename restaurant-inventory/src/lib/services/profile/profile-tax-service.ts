import { BusinessProfile } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
    BusinessProfileError,
    BusinessProfileDatabase,
    TaxSettings
} from "@/lib/types/business-profile";
import {
    transformDatabaseResponse,
    setCachedProfile,
    validateTaxRate
} from "@/lib/utils/business-profile-utils";

/**
 * Profile Tax Service
 * Operations for managing tax settings
 */
export const profileTaxService = {
    /**
     * Update tax settings for a business profile
     */
    updateTaxSettings: async (
        userId: string,
        taxSettings: TaxSettings
    ): Promise<BusinessProfile> => {
        try {
            console.log(`Updating tax settings for user ${userId}:`, taxSettings);

            // Validate tax rate
            if (!validateTaxRate(taxSettings.rate)) {
                throw new BusinessProfileError(
                    `Tax rate must be between 0% and 100%`,
                    'INVALID_TAX_RATE'
                );
            }

            // Get the current profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new BusinessProfileError(
                    `No profile found for user ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }

            const profileId = profiles[0].id;

            // Update the tax settings
            const updates = {
                tax_rate: taxSettings.rate,
                tax_enabled: taxSettings.enabled,
                tax_name: taxSettings.name || 'Sales Tax',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('business_profiles')
                .update(updates)
                .eq('id', profileId)
                .select()
                .single();

            if (error) {
                throw new BusinessProfileError(
                    `Failed to update tax settings: ${error.message}`,
                    'TAX_UPDATE_ERROR'
                );
            }

            const updatedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);
            setCachedProfile(userId, updatedProfile);
            console.log('Successfully updated tax settings:', data);
            return updatedProfile;
        } catch (error) {
            console.error('Error in updateTaxSettings:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to update tax settings',
                    'TAX_UPDATE_ERROR'
                );
        }
    },

    /**
     * Enable or disable tax calculation for a business profile
     */
    setTaxEnabled: async (
        userId: string,
        enabled: boolean
    ): Promise<BusinessProfile> => {
        try {
            console.log(`${enabled ? 'Enabling' : 'Disabling'} tax calculation for user ${userId}`);

            // Get the current profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, tax_rate, tax_name')
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

            // Keep existing tax rate and name, just update enabled status
            const updates = {
                tax_enabled: enabled,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('business_profiles')
                .update(updates)
                .eq('id', profile.id)
                .select()
                .single();

            if (error) {
                throw new BusinessProfileError(
                    `Failed to ${enabled ? 'enable' : 'disable'} tax calculation: ${error.message}`,
                    'TAX_UPDATE_ERROR'
                );
            }

            const updatedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);
            setCachedProfile(userId, updatedProfile);
            console.log(`Successfully ${enabled ? 'enabled' : 'disabled'} tax calculation`);
            return updatedProfile;
        } catch (error) {
            console.error(`Error ${error instanceof BusinessProfileError ? error.code : 'in setTaxEnabled'}:`, error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    `Failed to ${enabled ? 'enable' : 'disable'} tax calculation`,
                    'TAX_UPDATE_ERROR'
                );
        }
    },

    /**
     * Update tax rate for a business profile
     */
    updateTaxRate: async (
        userId: string,
        rate: number
    ): Promise<BusinessProfile> => {
        try {
            console.log(`Updating tax rate for user ${userId} to ${rate}%`);

            // Validate tax rate
            if (!validateTaxRate(rate)) {
                throw new BusinessProfileError(
                    `Tax rate must be between 0% and 100%`,
                    'INVALID_TAX_RATE'
                );
            }

            // Get the current profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new BusinessProfileError(
                    `No profile found for user ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }

            const profileId = profiles[0].id;

            // Update just the tax rate
            const updates = {
                tax_rate: rate,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('business_profiles')
                .update(updates)
                .eq('id', profileId)
                .select()
                .single();

            if (error) {
                throw new BusinessProfileError(
                    `Failed to update tax rate: ${error.message}`,
                    'TAX_RATE_UPDATE_ERROR'
                );
            }

            const updatedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);
            setCachedProfile(userId, updatedProfile);
            console.log('Successfully updated tax rate:', rate);
            return updatedProfile;
        } catch (error) {
            console.error('Error updating tax rate:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to update tax rate',
                    'TAX_RATE_UPDATE_ERROR'
                );
        }
    }
}; 