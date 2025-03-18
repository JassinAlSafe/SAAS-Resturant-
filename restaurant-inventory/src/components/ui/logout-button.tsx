"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

interface LogoutButtonProps extends Omit<ButtonProps, "onClick"> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  redirectTo?: string;
  className?: string;
  text?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  showIcon = true,
  redirectTo = "/login",
  className,
  text = "Sign Out",
  ...props
}: LogoutButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { signOut } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      router.push(redirectTo);
    } catch (error) {
      console.error("Logout failed", error);
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={cn(
        "transition-colors",
        variant === "ghost" &&
          "hover:text-red-600 hover:bg-red-50 dark:hover:text-red-500 dark:hover:bg-red-900/20",
        className
      )}
      {...props}
    >
      {isLoggingOut ? (
        <>
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          Signing out...
        </>
      ) : (
        <>
          {showIcon && <LogOutIcon className="mr-2 h-4 w-4" />}
          {text}
        </>
      )}
    </Button>
  );
}
