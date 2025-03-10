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
    const { user, profile: userProfile, signOut } = useAuth();
    const router = useRouter();

    // Combine data from both user and userProfile
    const userData: UserData = {
        name: userProfile?.name || user?.user_metadata?.name || "User",
        email: userProfile?.email || user?.email || "user@example.com",
        image: userProfile?.avatar_url || "",
        role: userProfile?.role || "staff",
        id: user?.id || userProfile?.id,
    };

    // Handle user logout
    const handleLogout = async () => {
        try {
            await signOut();
            toast.success("Logged out successfully");
            router.push("/login");
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