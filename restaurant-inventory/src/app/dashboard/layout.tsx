"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Get authenticated user
        const { data, error } = await supabase.auth.getUser();

        // Handle auth errors more gracefully
        if (error) {
          console.log(
            "Auth check failed, redirecting to login:",
            error.message
          );
          router.push("/login");
          return;
        }

        if (!data.user) {
          console.log("No authenticated user, redirecting to login");
          router.push("/login");
          return;
        }

        // Try to get the business profile
        try {
          const { data: profiles, error: profileError } = await supabase
            .from("business_profiles")
            .select("id")
            .eq("user_id", data.user.id)
            .limit(1);

          if (profileError) {
            console.error("Error fetching business profile:", profileError);
            // Only redirect on permission errors, not connection issues
            if (
              profileError.code === "PGRST301" ||
              profileError.code === "42P01" ||
              profileError.code === "42P17"
            ) {
              console.log(
                "Permission or table error, redirecting to onboarding"
              );
              router.push("/onboarding");
              return;
            }
          }

          if (!profiles || profiles.length === 0) {
            console.log("No business profile found, redirecting to onboarding");
            router.push("/onboarding");
            return;
          }

          setIsLoading(false);
        } catch (profileError) {
          console.error("Exception fetching business profile:", profileError);
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error in checkOnboarding:", error);
        router.push("/login");
      }
    };

    checkOnboarding();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
