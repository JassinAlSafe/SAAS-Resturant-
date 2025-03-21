"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear any auth cookies
        document.cookie = "sb-access-token=; path=/; max-age=0";
        document.cookie = "sb-refresh-token=; path=/; max-age=0";
        document.cookie = "supabase-auth-token=; path=/; max-age=0";
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Set a special cookie to prevent redirect loops
        document.cookie = "just-logged-out=true; path=/; max-age=30";
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      } catch (error) {
        console.error("Error during logout:", error);
        // Redirect to login even if there's an error
        window.location.href = "/login";
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Logging you out...</p>
    </div>
  );
}
