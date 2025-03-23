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
import { Loader2, ArrowRight, Check, X, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { Separator } from "@/components/ui/separator";
import { useBusinessProfile } from "@/lib/business-profile-context";
import { ThemeTest } from "@/components/theme-test";

export default function DebugPage() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useBusinessProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [businessProfileExists, setBusinessProfileExists] = useState<
    boolean | null
  >(null);
  const [runningTest, setRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any> | null>(
    null
  );
  const [serviceRoleStatus, setServiceRoleStatus] = useState<
    "same" | "ok" | "unchecked"
  >("unchecked");

  const checkConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the API route to check storage buckets instead of direct admin client
      const storageResponse = await fetch("/api/check-storage-status");
      if (storageResponse.ok) {
        const storageData = await storageResponse.json();
        setBuckets(storageData.bucketsList || []);
      } else {
        const errorData = await storageResponse.json();
        setError(
          `Failed to list buckets: ${errorData.message || "Unknown error"}`
        );
      }

      // List tables - using regular client is fine for tables with appropriate RLS
      const { data: tablesData, error: tablesError } = await supabase
        .from("pg_catalog.pg_tables")
        .select("tablename")
        .ilike("schemaname", "public");

      if (tablesError) {
        console.error("Error listing tables:", tablesError);
      } else {
        setTables(tablesData?.map((t) => t.tablename) || []);
      }

      // Check if business_profiles exists
      if (user?.id) {
        const { data, error: profileError } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        setBusinessProfileExists(!!data);

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error checking business profile:", profileError);
        }
      }
    } catch (err) {
      setError(
        `Error connecting to Supabase: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const runTest = async () => {
    setRunningTest(true);
    setTestResults(null);

    try {
      const response = await fetch("/api/test-supabase");
      const data = await response.json();
      setTestResults(data);
    } catch (err) {
      setError(
        `Error running test: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setRunningTest(false);
    }
  };

  const setupStorageBucket = async () => {
    setRunningTest(true);

    try {
      const response = await fetch("/api/setup-storage-bucket");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error setting up bucket:", errorData);
        setError(
          `Error setting up bucket: ${
            errorData.message || errorData.error || "Unknown error"
          }`
        );
        setTestResults(errorData);
      } else {
        const data = await response.json();
        setTestResults(data);
        await checkConnection(); // Refresh the data
      }
    } catch (err) {
      setError(
        `Error setting up bucket: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setRunningTest(false);
    }
  };

  // Function to check if service role and anon key are the same
  const checkServiceRoleKey = async () => {
    try {
      const response = await fetch("/api/check-supabase-keys");
      const data = await response.json();
      setServiceRoleStatus(data.keysAreSame ? "same" : "ok");
    } catch (err) {
      console.error("Error checking Supabase keys:", err);
      // Default to unchecked if there\'s an error
    }
  };

  useEffect(() => {
    checkConnection();
    checkServiceRoleKey();
  }, [user?.id]);

  return (
    <div className="container py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supabase Debug</h1>
        <div className="space-x-2">
          <Button
            onClick={checkConnection}
            variant="outline"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Refresh Status
          </Button>
          <Button
            onClick={() => fetch("/api/check-storage-policies")}
            variant="secondary"
            size="sm"
          >
            Check Policies
          </Button>
        </div>
      </div>

      {/* Theme Test Component */}
      <ThemeTest />

      {serviceRoleStatus === "same" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Security Issue Detected</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Your SUPABASE_SERVICE_ROLE_KEY is the same as your
              NEXT_PUBLIC_SUPABASE_ANON_KEY.
            </p>
            <p>
              This will cause permission issues when performing admin operations
              like creating buckets.
            </p>
            <div className="mt-2 p-4 bg-gray-900 text-white rounded-md">
              <p className="font-medium">How to fix this:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to Project Settings  API</li>
                <li>Copy the "service_role key" (not the anon/public key)</li>
                <li>Update your .env.local file with the correct key</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {testResults && (
        <Alert variant={testResults.error ? "destructive" : "default"}>
          <AlertTitle>
            {testResults.error ? "Error Details" : "Test Results"}
          </AlertTitle>
          <AlertDescription>
            <p>{testResults.message || testResults.error}</p>
            {testResults.hint && (
              <p className="mt-2 text-sm font-medium">{testResults.hint}</p>
            )}
            {testResults.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">
                  View Details
                </summary>
                <pre className="mt-2 p-2 bg-slate-100 rounded-md text-xs overflow-auto">
                  {JSON.stringify(testResults.details, null, 2)}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Connection to Supabase backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>User Authentication:</span>
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span>User ID:</span>
                <span className="font-mono text-sm">
                  {user?.id || "Not logged in"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Business Profile:</span>
                <Badge
                  variant={businessProfileExists ? "default" : "destructive"}
                >
                  {businessProfileExists === null
                    ? "Unknown"
                    : businessProfileExists
                    ? "Exists"
                    : "Not Found"}
                </Badge>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Storage Buckets:</h3>
                {buckets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No buckets found
                  </p>
                ) : (
                  <div className="space-y-1">
                    {buckets.map((bucket) => (
                      <div key={bucket} className="flex items-center">
                        <div className="w-6">
                          {bucket === "business_assets" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : null}
                        </div>
                        <span className="text-sm font-mono">{bucket}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!buckets.includes("business_assets") && (
                  <Button
                    onClick={setupStorageBucket}
                    className="mt-2"
                    size="sm"
                    variant="outline"
                    disabled={runningTest}
                  >
                    {runningTest ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Create business_assets Bucket
                  </Button>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Tables:</h3>
                <div className="h-32 overflow-y-auto border rounded-md p-2">
                  {tables.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No tables found
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {tables.map((table) => (
                        <div key={table} className="flex items-center">
                          <div className="w-6">
                            {["business_profiles", "profiles"].includes(
                              table
                            ) ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : null}
                          </div>
                          <span className="text-sm font-mono">{table}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={runTest} disabled={runningTest} className="w-full">
              {runningTest ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Run Connection Test
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Details of your business profile</CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{profile.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{profile.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Logo:</span>
                  <span>
                    {profile.logo ? (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Check className="h-3 w-3 text-green-500" />
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <X className="h-3 w-3 text-red-500" />
                        Not Set
                      </Badge>
                    )}
                  </span>
                </div>

                {profile.logo && (
                  <div className="border rounded-md p-4 mt-2">
                    <div className="aspect-square w-32 mx-auto relative">
                      <img
                        src={profile.logo}
                        alt="Business Logo"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-medium">ID:</span>
                  <span className="font-mono text-xs">{profile.id}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No business profile found
                </p>
                <Button asChild variant="outline">
                  <a href="/settings/business">
                    Create Business Profile{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
          {profile && (
            <CardFooter>
              <Button
                variant="outline"
                onClick={refreshProfile}
                className="w-full"
              >
                Refresh Profile Data
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results from the last test run</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
