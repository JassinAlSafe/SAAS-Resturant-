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
                role: profile.role as User["role"]
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
                role: data.role as User["role"]
            };
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    // Update a user's role
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
                role: data.role as User["role"]
            };
        } catch (error) {
            console.error("Error updating user role:", error);
            throw error;
        }
    },

    // Invite a new user
    inviteUser: async (email: string, name: string, role: User["role"]): Promise<{ success: boolean, message: string }> => {
        try {
            // In a real app, this would send an invitation email with a signup link
            // For this mock implementation, we'll simulate the process

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
                        role
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
            // For now, we'll just return success with the temp password
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