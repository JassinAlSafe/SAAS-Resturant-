"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createVerificationClient } from "@/lib/supabase/verification-client";

export default function VerificationPage() {
  const [isStuck, setIsStuck] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createVerificationClient();

    // Check if we're already authenticated
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // User is already authenticated, go to dashboard
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    // Set a timeout to detect if we're stuck in loading
    const stuckTimeout = setTimeout(() => {
      setIsStuck(true);
    }, 8000);

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        clearTimeout(stuckTimeout);
        router.push("/dashboard");
      }
    });

    checkAuth();

    return () => {
      clearTimeout(stuckTimeout);
      subscription.unsubscribe();
    };
  }, [router]);

  // Force a hard refresh if stuck
  const handleForceRefresh = () => {
    // Clear any cached state
    sessionStorage.clear();
    localStorage.removeItem("supabase-auth-token");

    // Hard refresh
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Email Verification
        </h1>

        {isStuck ? (
          <div className="flex flex-col items-center space-y-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Verification Completed
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your account appears to be verified but we&apos;re having
                trouble redirecting you.
              </p>
            </div>
            <Button
              onClick={handleForceRefresh}
              className="bg-orange-600 hover:bg-orange-700 text-white mt-2"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Verifying your email
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
