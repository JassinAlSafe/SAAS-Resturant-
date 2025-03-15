import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function useSecuritySettings() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accountDeletionConfirmation, setAccountDeletionConfirmation] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!user) throw new Error("User not authenticated");

            if (newPassword !== confirmPassword) {
                toast({
                    title: "Password Mismatch",
                    description: "New password and confirmation do not match.",
                    variant: "destructive",
                });
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            // Clear password fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
            });
        } catch (error) {
            console.error("Error changing password:", error);
            toast({
                title: "Update Failed",
                description:
                    "There was a problem changing your password. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        if (accountDeletionConfirmation !== user.email) {
            toast({
                title: "Confirmation Failed",
                description:
                    "Please enter your email address correctly to confirm account deletion.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Delete user data and account
            await Promise.all([
                supabase.from("profiles").delete().eq("id", user.id),
                // Add any other tables that need to be cleaned up
                supabase.auth.admin.deleteUser(user.id), // This would need admin privileges
            ]);

            // Clear confirmation field
            setAccountDeletionConfirmation("");

            toast({
                title: "Account Deleted",
                description:
                    "Your account has been successfully deleted. You will be signed out shortly.",
            });

            // Sign out the user
            await supabase.auth.signOut();

            // Redirect to home page after a short delay
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (error) {
            console.error("Error deleting account:", error);
            toast({
                title: "Deletion Failed",
                description:
                    "There was a problem deleting your account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        accountDeletionConfirmation,
        setAccountDeletionConfirmation,
        isLoading,
        handlePasswordChange,
        handleDeleteAccount,
    };
} 