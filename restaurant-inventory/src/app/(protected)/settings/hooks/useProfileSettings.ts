import { useState } from "react";
import { useAuth } from "@/lib/services/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export function useProfileSettings() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState(profile?.name || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase
                .from("profiles")
                .update({ name, updated_at: new Date().toISOString() })
                .eq("id", user.id);

            if (error) throw error;

            toast({
                title: "Profile Updated",
                description: "Your profile information has been updated successfully.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Update Failed",
                description:
                    "There was a problem updating your profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        profile,
        name,
        setName,
        isLoading,
        handleProfileUpdate,
    };
} 