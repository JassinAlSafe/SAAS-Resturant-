"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export function RestaurantIconsSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [policies, setPolicies] = useState<
    Array<{
      name: string;
      operation: string;
      definition: string;
    }>
  >([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
    solution?: string;
  } | null>(null);

  const { session } = useAuth();

  // Check if the bucket already exists
  const checkBucketStatus = async () => {
    setIsChecking(true);
    setResult(null);

    try {
      // First check if we have a session
      if (!session) {
        console.error("No auth session available");
        setResult({
          success: false,
          message: "Authentication required. Please log in again.",
        });
        setBucketExists(null);
        setIsChecking(false);
        return;
      }

      // Get a fresh token to ensure we have the latest auth state
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        console.error("No current session found");
        setResult({
          success: false,
          message: "Your session has expired. Please log in again.",
        });
        setBucketExists(null);
        setIsChecking(false);
        return;
      }

      console.log("Making API request with authenticated session");
      console.log("Access token available:", !!currentSession.access_token);

      try {
        const response = await fetch("/api/setup-restaurant-icons", {
          method: "GET",
          credentials: "include", // Include cookies for authentication
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        });

        console.log("API response status:", response.status);
        console.log(
          "API response headers:",
          Object.fromEntries([...response.headers.entries()])
        );

        // Check if the response is ok (status in the range 200-299)
        if (response.ok) {
          const data = await response.json();
          console.log("API response data:", data);
          setBucketExists(data.bucketExists);
          setPolicies(data.policies || []);
          setResult(null); // Clear any previous errors
        } else {
          let errorMessage = `Failed to check bucket status: ${response.status} ${response.statusText}`;
          let errorDetails = {};
          let solution = undefined;

          // Try to parse the error response as JSON
          try {
            const errorText = await response.text();
            console.error("Error response text:", errorText);

            if (errorText) {
              try {
                const errorData = JSON.parse(errorText);
                console.error("Parsed error data:", errorData);
                errorMessage = errorData.error || errorMessage;
                errorDetails = errorData.details || {};
                solution = errorData.solution;

                // Special handling for RLS policy errors
                if (
                  errorMessage.includes("Row-Level Security Policy Error") ||
                  (errorDetails &&
                    typeof errorDetails === "object" &&
                    "message" in errorDetails &&
                    String(errorDetails.message).includes(
                      "row-level security policy"
                    ))
                ) {
                  errorMessage =
                    "Storage permission error: Row-Level Security Policy violation";
                  solution =
                    solution ||
                    "Please contact your administrator to fix the storage bucket permissions.";
                }
              } catch (parseError) {
                console.error("Error parsing JSON response:", parseError);
                errorDetails = { rawResponse: errorText };
              }
            } else {
              console.error("Empty error response");
              errorDetails = { emptyResponse: true };
            }
          } catch (textError) {
            console.error("Error getting response text:", textError);
            errorDetails = { responseTextError: String(textError) };
          }

          setBucketExists(null);
          setPolicies([]);
          setResult({
            success: false,
            message: errorMessage,
            details: errorDetails,
            solution,
          });
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        setBucketExists(null);
        setPolicies([]);
        setResult({
          success: false,
          message: `Network error: ${
            fetchError instanceof Error ? fetchError.message : "Unknown error"
          }`,
          details: { fetchError: String(fetchError) },
        });
      }
    } catch (error) {
      console.error("Error in checkBucketStatus:", error);
      setBucketExists(null);
      setPolicies([]);
      setResult({
        success: false,
        message: `Error checking bucket status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: { error: String(error) },
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Setup the bucket
  const setupBucket = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // First check if we have a session
      if (!session) {
        console.error("No auth session available");
        setResult({
          success: false,
          message: "Authentication required. Please log in again.",
        });
        setIsLoading(false);
        return;
      }

      // Get a fresh token to ensure we have the latest auth state
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        console.error("No current session found");
        setResult({
          success: false,
          message: "Your session has expired. Please log in again.",
        });
        setIsLoading(false);
        return;
      }

      console.log("Making API request with authenticated session");
      console.log("Access token available:", !!currentSession.access_token);

      try {
        const response = await fetch("/api/setup-restaurant-icons", {
          method: "GET",
          credentials: "include", // Include cookies for authentication
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        });

        console.log("API response status:", response.status);
        console.log(
          "API response headers:",
          Object.fromEntries([...response.headers.entries()])
        );

        // Check if the response is ok (status in the range 200-299)
        if (response.ok) {
          const data = await response.json();
          console.log("API response data:", data);
          setResult({
            success: true,
            message: "Restaurant icons storage bucket set up successfully!",
            details: data,
          });
          setBucketExists(true);
          setPolicies(data.policies || []);
        } else {
          let errorMessage = `Failed to set up bucket: ${response.status} ${response.statusText}`;
          let errorDetails = {};
          let solution = undefined;

          // Try to parse the error response as JSON
          try {
            const errorText = await response.text();
            console.error("Error response text:", errorText);

            if (errorText) {
              try {
                const errorData = JSON.parse(errorText);
                console.error("Parsed error data:", errorData);
                errorMessage = errorData.error || errorMessage;
                errorDetails = errorData.details || {};
                solution = errorData.solution;

                // Special handling for RLS policy errors
                if (
                  errorMessage.includes("Row-Level Security Policy Error") ||
                  (errorDetails &&
                    typeof errorDetails === "object" &&
                    "message" in errorDetails &&
                    String(errorDetails.message).includes(
                      "row-level security policy"
                    ))
                ) {
                  errorMessage =
                    "Storage permission error: Row-Level Security Policy violation";
                  solution =
                    solution ||
                    "Please contact your administrator to fix the storage bucket permissions.";
                }
              } catch (parseError) {
                console.error("Error parsing JSON response:", parseError);
                errorDetails = { rawResponse: errorText };
              }
            } else {
              console.error("Empty error response");
              errorDetails = { emptyResponse: true };
            }
          } catch (textError) {
            console.error("Error getting response text:", textError);
            errorDetails = { responseTextError: String(textError) };
          }

          setResult({
            success: false,
            message: errorMessage,
            details: errorDetails,
            solution,
          });
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        setResult({
          success: false,
          message: `Network error: ${
            fetchError instanceof Error ? fetchError.message : "Unknown error"
          }`,
          details: { fetchError: String(fetchError) },
        });
      }
    } catch (error) {
      console.error("Error in setupBucket:", error);
      setResult({
        success: false,
        message: `Error setting up bucket: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: { error: String(error) },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check bucket status on component mount
  useEffect(() => {
    // Only check if we have a session
    if (session) {
      checkBucketStatus();
    } else {
      setIsChecking(false);
      setBucketExists(null);
      setResult({
        success: false,
        message:
          "Authentication required. Please log in to access storage settings.",
      });
    }
  }, [session]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Restaurant Icons Storage
        </CardTitle>
        <CardDescription>
          Secure storage for your restaurant logo and icons
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isChecking ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Checking storage status...
            </span>
          </div>
        ) : !session ? (
          <Alert className="bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please log in to access storage settings.
            </AlertDescription>
          </Alert>
        ) : bucketExists ? (
          <Alert className="bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Storage Ready</AlertTitle>
            <AlertDescription>
              The secure restaurant icons storage bucket is set up and ready to
              use.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Storage Setup Required</AlertTitle>
            <AlertDescription>
              The secure restaurant icons storage bucket needs to be set up
              before you can upload logos.
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert
            variant={result.success ? "default" : "destructive"}
            className="mb-4"
          >
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>
              <p>{result.message}</p>
              {result.solution && (
                <p className="mt-2 text-sm font-medium">
                  Solution: {result.solution}
                </p>
              )}
              {result.details && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer">View Details</summary>
                  <pre className="mt-2 w-full overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-50">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        {showDiagnostics && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Diagnostics:</h4>
            <div className="max-h-40 overflow-y-auto rounded border p-2 text-xs">
              <p>
                <strong>Session:</strong>{" "}
                {session ? "Available" : "Not available"}
              </p>
              <p>
                <strong>User ID:</strong> {session?.user?.id || "Not logged in"}
              </p>
              {result?.details && (
                <div className="mt-2">
                  <p>
                    <strong>Error Details:</strong>
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {policies.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium">Security Policies:</h4>
                <div className="max-h-40 overflow-y-auto rounded border p-2 text-xs">
                  <ul className="space-y-1">
                    {policies.map((policy, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          {policy.operation}
                        </Badge>
                        <span>{policy.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        >
          {showDiagnostics ? "Hide Details" : "Show Details"}
        </Button>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkBucketStatus}
            disabled={isChecking || isLoading || !session}
          >
            {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Status
          </Button>
          {!bucketExists && session && (
            <Button
              variant="default"
              size="sm"
              onClick={setupBucket}
              disabled={isLoading || isChecking || !session}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Up Storage
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
