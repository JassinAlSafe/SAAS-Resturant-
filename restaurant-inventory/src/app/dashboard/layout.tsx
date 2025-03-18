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
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        // Check if user has completed onboarding
        const { data: profiles } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1);

        if (!profiles || profiles.length === 0) {
          router.push("/onboarding");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
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
