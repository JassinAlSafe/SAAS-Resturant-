import { BusinessProfile } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { BusinessProfileError } from "@/lib/types/business-profile";

/**
 * Profile Debug Service
 * Utilities for debugging profile-related issues
 */
export const profileDebugService = {
    /**
     * Attempts to diagnose profile access issues for a user
     */
    diagnoseProfileAccess: async (userId: string): Promise<{
        hasDirectProfile: boolean;
        hasJoinTableEntry: boolean;
        diagnosticInfo: Record<string, any>;
    }> => {
        try {
            console.log(`Running profile diagnostic for user ${userId}`);
            const diagnosticInfo: Record<string, any> = {
                userId,
                timestamp: new Date().toISOString()
            };

            // Check direct profile access
            const { data: directProfiles, error: directError } = await supabase
                .from('business_profiles')
                .select('id, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            diagnosticInfo.directProfileCount = directProfiles?.length || 0;
            diagnosticInfo.directProfileError = directError?.message;
            diagnosticInfo.hasDirectProfile = !directError && directProfiles && directProfiles.length > 0;

            // Check join table access
            const { data: joinProfiles, error: joinError } = await supabase
                .from('business_profile_users')
                .select('business_profile_id')
                .eq('user_id', userId);

            diagnosticInfo.joinTableCount = joinProfiles?.length || 0;
            diagnosticInfo.joinTableError = joinError?.message;
            diagnosticInfo.hasJoinTableEntry = !joinError && joinProfiles && joinProfiles.length > 0;

            // Log diagnostic information
            console.log('Profile diagnostic results:', diagnosticInfo);

            return {
                hasDirectProfile: diagnosticInfo.hasDirectProfile,
                hasJoinTableEntry: diagnosticInfo.hasJoinTableEntry,
                diagnosticInfo
            };
        } catch (error) {
            console.error('Error in profile diagnostics:', error);
            return {
                hasDirectProfile: false,
                hasJoinTableEntry: false,
                diagnosticInfo: { error: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    },

    /**
     * Validate a business profile object to check if it has all required properties
     */
    validateProfileObject: (profile: any): {
        isValid: boolean;
        missingFields: string[];
        profile: BusinessProfile | null;
    } => {
        if (!profile || typeof profile !== 'object') {
            return { isValid: false, missingFields: ['entire object'], profile: null };
        }

        // Fields to check - matching actual database structure
        const requiredFields = [
            'id', 'name', 'type', 'operatingHours',
            'defaultCurrency', 'taxRate', 'taxEnabled', 'taxName',
            'createdAt', 'userId'
        ];

        const missingFields = requiredFields.filter(field => {
            // For nested properties like operatingHours, check if it exists
            if (field === 'operatingHours') {
                return !profile.operatingHours || typeof profile.operatingHours !== 'object';
            }
            return profile[field] === undefined;
        });

        // Calculate taxSettings from individual tax fields if needed
        if (profile && !profile.taxSettings && profile.taxRate !== undefined && profile.taxEnabled !== undefined) {
            profile.taxSettings = {
                enabled: profile.taxEnabled,
                rate: profile.taxRate,
                name: profile.taxName || 'Sales Tax'
            };
        }

        return {
            isValid: missingFields.length === 0,
            missingFields,
            profile: missingFields.length === 0 ? profile as BusinessProfile : null
        };
    }
};
