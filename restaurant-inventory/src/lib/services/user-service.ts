import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";

// Define the permission structure
export type Permission =
    | "view:inventory"
    | "edit:inventory"
    | "delete:inventory"
    | "view:sales"
    | "edit:sales"
    | "delete:sales"
    | "view:dishes"
    | "edit:dishes"
    | "delete:dishes"
    | "view:suppliers"
    | "edit:suppliers"
    | "delete:suppliers"
    | "manage:users";

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<User["role"], Permission[]> = {
    admin: [
        "view:inventory", "edit:inventory", "delete:inventory",
        "view:sales", "edit:sales", "delete:sales",
        "view:dishes", "edit:dishes", "delete:dishes",
        "view:suppliers", "edit:suppliers", "delete:suppliers",
        "manage:users"
    ],
    manager: [
        "view:inventory", "edit:inventory", "delete:inventory",
        "view:sales", "edit:sales", "delete:sales",
        "view:dishes", "edit:dishes", "delete:dishes",
        "view:suppliers", "edit:suppliers", "delete:suppliers"
    ],
    staff: [
        "view:inventory", "edit:inventory",
        "view:sales",
        "view:dishes",
        "view:suppliers"
    ]
};

// User service for managing users
export const userService = {
    // Get all users
    getUsers: async (): Promise<User[]> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("name");

            if (error) {
                throw error;
            }

            return data.map((profile) => ({
                id: profile.id,
                email: profile.email,
                name: profile.name || "",
                role: profile.role as User["role"],
                avatar_url: profile.avatar_url,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
                last_login: profile.last_login,
                status: profile.status || "active",
                department: profile.department,
                mfa_enabled: profile.mfa_enabled || false
            }));
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    // Get a specific user
    getUser: async (userId: string): Promise<User | null> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                throw error;
            }

            if (!data) {
                return null;
            }

            return {
                id: data.id,
                email: data.email,
                name: data.name || "",
                role: data.role as User["role"],
                avatar_url: data.avatar_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
                last_login: data.last_login,
                status: data.status || "active",
                department: data.department,
                mfa_enabled: data.mfa_enabled || false
            };
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    // Update a user\'s role
    updateUserRole: async (userId: string, role: User["role"]): Promise<User> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({ role, updated_at: new Date().toISOString() })
                .eq("id", userId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                email: data.email,
                name: data.name || "",
                role: data.role as User["role"],
                avatar_url: data.avatar_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
                last_login: data.last_login,
                status: data.status || "active",
                department: data.department,
                mfa_enabled: data.mfa_enabled || false
            };
        } catch (error) {
            console.error("Error updating user role:", error);
            throw error;
        }
    },

    // Update user status
    updateUserStatus: async (userId: string, status: User["status"]): Promise<User> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", userId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                email: data.email,
                name: data.name || "",
                role: data.role as User["role"],
                avatar_url: data.avatar_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
                last_login: data.last_login,
                status: data.status,
                department: data.department,
                mfa_enabled: data.mfa_enabled || false
            };
        } catch (error) {
            console.error("Error updating user status:", error);
            throw error;
        }
    },

    // Update user department
    updateUserDepartment: async (userId: string, department: string): Promise<User> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({ department, updated_at: new Date().toISOString() })
                .eq("id", userId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                id: data.id,
                email: data.email,
                name: data.name || "",
                role: data.role as User["role"],
                avatar_url: data.avatar_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
                last_login: data.last_login,
                status: data.status || "active",
                department: data.department,
                mfa_enabled: data.mfa_enabled || false
            };
        } catch (error) {
            console.error("Error updating user department:", error);
            throw error;
        }
    },

    // Invite a new user
    inviteUser: async (email: string, name: string, role: User["role"], department?: string): Promise<{ success: boolean, message: string }> => {
        try {
            // Check if user already exists
            const { data: existingUser } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", email)
                .single();

            if (existingUser) {
                return {
                    success: false,
                    message: "A user with this email already exists."
                };
            }

            // Generate a random password (in a real app, the user would set their own password)
            const tempPassword = Math.random().toString(36).slice(-8);

            // Create the user in Supabase Auth
            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { name }
            });

            if (error) {
                console.error("Error creating user:", error);
                return {
                    success: false,
                    message: "Failed to create user. " + error.message
                };
            }

            if (!data.user) {
                return {
                    success: false,
                    message: "Failed to create user. No user data returned."
                };
            }

            // Create the user profile with the specified role
            const { error: profileError } = await supabase
                .from("profiles")
                .insert([
                    {
                        id: data.user.id,
                        email,
                        name,
                        role,
                        department,
                        status: "pending",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (profileError) {
                console.error("Error creating profile:", profileError);
                return {
                    success: false,
                    message: "User created but failed to set role. " + profileError.message
                };
            }

            // In a real app, send an email with the invitation link
            // For now, we\'ll just return success with the temp password
            return {
                success: true,
                message: `User invited successfully. Temporary password: ${tempPassword}`
            };
        } catch (error: any) {
            console.error("Error inviting user:", error);
            return {
                success: false,
                message: "An unexpected error occurred. " + error.message
            };
        }
    },

    // Resend invitation
    resendInvitation: async (userId: string): Promise<{ success: boolean, message: string }> => {
        try {
            // In a real app, this would regenerate the invitation link and send a new email
            // For this mock implementation, we\'ll simulate the process

            // Get the user\'s email
            const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("email, name")
                .eq("id", userId)
                .single();

            if (userError || !userData) {
                return {
                    success: false,
                    message: "User not found."
                };
            }

            // Update the user\'s status to ensure it\'s still pending
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    status: "pending",
                    updated_at: new Date().toISOString()
                })
                .eq("id", userId);

            if (updateError) {
                return {
                    success: false,
                    message: "Failed to update user status."
                };
            }

            // Generate a new temporary password
            const newTempPassword = Math.random().toString(36).slice(-8);

            // In a real app, we would send an email with the new invitation link
            // For now, we\'ll just return success with the new temp password
            return {
                success: true,
                message: `Invitation resent to ${userData.email}. New temporary password: ${newTempPassword}`
            };
        } catch (error: any) {
            console.error("Error resending invitation:", error);
            return {
                success: false,
                message: "An unexpected error occurred. " + error.message
            };
        }
    },

    // Remove a user
    removeUser: async (userId: string): Promise<boolean> => {
        try {
            // Delete the user from Supabase Auth
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);

            if (authError) {
                console.error("Error deleting user from auth:", authError);
                return false;
            }

            // The profile should be automatically deleted due to the foreign key constraint
            return true;
        } catch (error) {
            console.error("Error removing user:", error);
            return false;
        }
    },

    // Bulk update user roles
    bulkUpdateRoles: async (userIds: string[], role: User["role"]): Promise<{ success: boolean, message: string }> => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    role,
                    updated_at: new Date().toISOString()
                })
                .in("id", userIds);

            if (error) {
                return {
                    success: false,
                    message: "Failed to update roles. " + error.message
                };
            }

            return {
                success: true,
                message: `Successfully updated ${userIds.length} user(s) to ${role} role.`
            };
        } catch (error: any) {
            console.error("Error bulk updating roles:", error);
            return {
                success: false,
                message: "An unexpected error occurred. " + error.message
            };
        }
    },

    // Bulk delete users
    bulkDeleteUsers: async (userIds: string[]): Promise<{ success: boolean, message: string }> => {
        try {
            // Delete users one by one since Supabase doesn\'t support bulk delete for auth users
            let successCount = 0;
            let failCount = 0;

            for (const userId of userIds) {
                const { error } = await supabase.auth.admin.deleteUser(userId);
                if (error) {
                    console.error(`Error deleting user ${userId}:`, error);
                    failCount++;
                } else {
                    successCount++;
                }
            }

            if (failCount > 0) {
                return {
                    success: successCount > 0,
                    message: `Successfully deleted ${successCount} user(s). Failed to delete ${failCount} user(s).`
                };
            }

            return {
                success: true,
                message: `Successfully deleted ${successCount} user(s).`
            };
        } catch (error: any) {
            console.error("Error bulk deleting users:", error);
            return {
                success: false,
                message: "An unexpected error occurred. " + error.message
            };
        }
    },

    // Check if a user has a specific permission
    hasPermission: (userRole: User["role"], permission: Permission): boolean => {
        return ROLE_PERMISSIONS[userRole].includes(permission);
    },

    // Get all permissions for a role
    getRolePermissions: (role: User["role"]): Permission[] => {
        return ROLE_PERMISSIONS[role];
    }
};

// Hook for checking permissions (to be used in components)
export function usePermissions(userRole: User["role"] | undefined) {
    const hasPermission = (permission: Permission): boolean => {
        if (!userRole) return false;
        return ROLE_PERMISSIONS[userRole].includes(permission);
    };

    return { hasPermission };
} 