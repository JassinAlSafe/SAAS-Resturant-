"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/services/auth-service";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Use the centralized auth service to handle logout
        await authService.logout();
      } catch (error) {
        console.error("Error during logout:", error);
        // Redirect to login even if there's an error
        window.location.href = "/login?error=logout_failed";
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-semibold mb-2">Logging out...</h1>
        <p className="text-muted-foreground">
          Please wait while we securely log you out.
        </p>
      </div>
    </div>
  );
}
