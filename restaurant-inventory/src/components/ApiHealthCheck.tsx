"use client";

import { useEffect, useState } from "react";
import { healthCheck } from "@/lib/utils/supabase-utils";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/contexts/auth-context";

export function ApiHealthCheck() {
  const { toast } = useToast();
  const { status, waitForAuth } = useAuth();
  const [showError, setShowError] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Run health check only when auth is ready
  useEffect(() => {
    let isMounted = true;

    const runHealthCheck = async () => {
      try {
        // Skip check if auth hasn't initialized
        if (status === "initializing") {
          console.log("Auth is still initializing, delaying health check");
          // Wait for auth to be ready
          await waitForAuth(5000);
          if (!isMounted) return;
        }

        console.log("Running Supabase health check...");
        const result = await healthCheck();

        if (!isMounted) return;

        if (!result.success) {
          console.error(
            "Supabase health check failed - your API key may be invalid:",
            result
          );

          toast({
            title: "Connection Issue",
            description:
              "Unable to connect to the database. Some features may not work correctly.",
            variant: "destructive",
          });

          setShowError(true);
        } else {
          console.log("Supabase health check passed - API key is valid");
          setShowError(false);
        }

        setHasChecked(true);
      } catch (error) {
        console.error("Error performing health check:", error);

        if (isMounted) {
          setShowError(true);
          setHasChecked(true);
        }
      }
    };

    // Only run once
    if (!hasChecked) {
      runHealthCheck();
    }

    return () => {
      isMounted = false;
    };
  }, [toast, status, hasChecked, waitForAuth]);

  if (!showError) return null;

  return (
    <Alert variant="destructive" className="mb-4 max-w-4xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        We&apos;re having trouble connecting to our servers. Some features may
        not work correctly. Please try refreshing the page or contact support if
        the issue persists.
      </AlertDescription>
    </Alert>
  );
}
