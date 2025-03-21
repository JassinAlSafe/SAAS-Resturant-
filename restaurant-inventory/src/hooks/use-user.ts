"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface UserData {
    name: string;
    email: string;
    image?: string;
    role?: string;
    id?: string;
}

/**
 * Custom hook to access and format user data from auth context
 * @returns Formatted user data and auth methods
 */
export function useUser() {
    const router = useRouter();
    const { user, profile } = useAuth();

    // Combine data from both user and userProfile
    const userData: UserData = {
        name: profile?.name || "",
        email: profile?.email || user?.email || "",
        image: profile?.avatar_url || "",
        role: profile?.role || "",
        id: user?.id || "",
    };

    // Handle user logout
    const handleLogout = async () => {
        try {
            // Redirect to the dedicated logout page
            router.push("/logout");
        } catch (error) {
            console.error("Logout failed", error);
            toast.error("Failed to logout. Please try again.");
        }
    };

    return {
        user: userData,
        isAuthenticated: !!user,
        handleLogout,
    };
} 