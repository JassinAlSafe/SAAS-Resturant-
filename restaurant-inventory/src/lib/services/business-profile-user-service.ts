import { supabase } from '@/lib/supabase';

export interface BusinessProfileUser {
    id: string;
    user_id: string;
    business_profile_id: string;
    role: 'owner' | 'manager' | 'staff';
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export class BusinessProfileUserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BusinessProfileUserError';
    }
}

/**
 * Checks if a user has access to any business profiles
 */
export async function checkBusinessProfileAccess(userId: string): Promise<{
    hasAccess: boolean;
    profiles: { business_profile_id: string; role: string }[];
}> {
    try {
        const { data, error } = await supabase
            .from('business_profile_users')
            .select('business_profile_id, role')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw new BusinessProfileUserError(`Failed to check business profile access: ${error.message}`);

        return {
            hasAccess: Array.isArray(data) && data.length > 0,
            profiles: data || []
        };
    } catch (error) {
        console.error('Error checking business profile access:', error);
        return {
            hasAccess: false,
            profiles: []
        };
    }
}

/**
 * Get all users for a specific business profile
 */
export async function getBusinessProfileUsers(businessProfileId: string): Promise<BusinessProfileUser[]> {
    try {
        const { data, error } = await supabase
            .from('business_profile_users')
            .select('*')
            .eq('business_profile_id', businessProfileId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw new BusinessProfileUserError(`Failed to fetch business profile users: ${error.message}`);
        return data as BusinessProfileUser[];
    } catch (error) {
        console.error('Error fetching business profile users:', error);
        return [];
    }
}

/**
 * Add a user to a business profile with a specific role
 */
export async function addUserToBusinessProfile(
    businessProfileId: string,
    userId: string,
    role: 'owner' | 'manager' | 'staff'
): Promise<BusinessProfileUser | null> {
    try {
        // Check if user already exists in the business profile
        const { data: existingUser } = await supabase
            .from('business_profile_users')
            .select('*')
            .eq('business_profile_id', businessProfileId)
            .eq('user_id', userId)
            .single();

        if (existingUser) {
            // If user exists but is inactive, reactivate them
            if (!existingUser.is_active) {
                const { data, error } = await supabase
                    .from('business_profile_users')
                    .update({
                        role,
                        is_active: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingUser.id)
                    .select()
                    .single();

                if (error) throw new BusinessProfileUserError(`Failed to reactivate user: ${error.message}`);
                return data as BusinessProfileUser;
            }

            // Otherwise, update the role if different
            if (existingUser.role !== role) {
                const { data, error } = await supabase
                    .from('business_profile_users')
                    .update({
                        role,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingUser.id)
                    .select()
                    .single();

                if (error) throw new BusinessProfileUserError(`Failed to update user role: ${error.message}`);
                return data as BusinessProfileUser;
            }

            return existingUser as BusinessProfileUser;
        }

        // If user doesn't exist, add them
        const { data, error } = await supabase
            .from('business_profile_users')
            .insert({
                business_profile_id: businessProfileId,
                user_id: userId,
                role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true
            })
            .select()
            .single();

        if (error) throw new BusinessProfileUserError(`Failed to add user to business profile: ${error.message}`);
        return data as BusinessProfileUser;
    } catch (error) {
        console.error('Error adding user to business profile:', error);
        return null;
    }
}

/**
 * Update a user's role in a business profile
 */
export async function updateUserRole(
    businessProfileId: string,
    userId: string,
    role: 'owner' | 'manager' | 'staff'
): Promise<BusinessProfileUser | null> {
    try {
        const { data, error } = await supabase
            .from('business_profile_users')
            .update({
                role,
                updated_at: new Date().toISOString()
            })
            .eq('business_profile_id', businessProfileId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw new BusinessProfileUserError(`Failed to update user role: ${error.message}`);
        return data as BusinessProfileUser;
    } catch (error) {
        console.error('Error updating user role:', error);
        return null;
    }
}

/**
 * Remove a user from a business profile (soft delete)
 */
export async function removeUserFromBusinessProfile(
    businessProfileId: string,
    userId: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('business_profile_users')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('business_profile_id', businessProfileId)
            .eq('user_id', userId);

        if (error) throw new BusinessProfileUserError(`Failed to remove user from business profile: ${error.message}`);
        return true;
    } catch (error) {
        console.error('Error removing user from business profile:', error);
        return false;
    }
}

/**
 * Create a new business profile and add the user as owner
 * This function uses the secure RPC function to ensure proper permissions
 */
export async function createBusinessProfileWithUser(
    userId: string,
    profileData: {
        name: string;
        type: string;
        operating_hours?: Record<string, unknown>;
        default_currency?: string;
        tax_enabled?: boolean;
        tax_rate?: number;
        tax_name?: string;
    }
): Promise<{ id: string } | null> {
    try {
        const { data, error } = await supabase.rpc(
            'create_business_profile_with_user',
            {
                p_user_id: userId,
                p_name: profileData.name,
                p_type: profileData.type,
                p_operating_hours: profileData.operating_hours || {},
                p_default_currency: profileData.default_currency || 'USD',
                p_tax_enabled: profileData.tax_enabled || false,
                p_tax_rate: profileData.tax_rate || 0,
                p_tax_name: profileData.tax_name || 'Sales Tax'
            }
        );

        if (error) throw new BusinessProfileUserError(`Failed to create business profile: ${error.message}`);
        return data as { id: string } | null;
    } catch (error) {
        console.error('Error creating business profile with user:', error);
        return null;
    }
}

export const businessProfileUserService = {
    checkBusinessProfileAccess,
    getBusinessProfileUsers,
    addUserToBusinessProfile,
    updateUserRole,
    removeUserFromBusinessProfile,
    createBusinessProfileWithUser
}; 