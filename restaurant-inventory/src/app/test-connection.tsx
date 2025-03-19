"use client";

import { waitForAuthWithTimeout } from "@/lib/utils/auth-utils";
import { useEffect, useState } from "react";
import {
  healthCheck,
  pingSupabase,
  testDatabaseTables,
} from "@/lib/utils/supabase-utils";
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define TypeScript interfaces
interface TestError {
  message: string;
  code?: string;
  hint?: string;
}

interface TestResult {
  success: boolean;
  error: TestError | null;
  exists?: boolean;
}

interface DatabaseResults {
  success: boolean;
  message?: string;
  error?: string;
  results: Record<string, TestResult>;
}

interface HealthResult {
  success: boolean;
  status?: number;
  error?: string | TestError;
  message?: string;
}

interface PingResult {
  success: boolean;
  data?: Record<string, unknown>;
  apiKeyValid?: boolean;
  error?: string | TestError;
  message?: string;
  status?: number;
}

interface TestResults {
  health?: HealthResult;
  ping?: PingResult;
  database?: DatabaseResults;
  error?: string;
  timestamp: string;
}

/**
 * A diagnostic page to test Supabase connection and permissions
 */
export default function TestConnectionPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    // Run the initial test only once if auth is already initialized
    if (isInitialized && !results && !loading) {
      runTests();
    } else if (!isInitialized && !loading) {
      // If auth is not initialized, wait for it with a timeout
      const initAuth = async () => {
        setLoading(true);
        console.log("Waiting for auth initialization before running tests...");

        const initialized = await waitForAuthWithTimeout(5000);
        if (initialized) {
          console.log("Auth initialized, running tests");
          runTests();
        } else {
          console.warn("Auth initialization timed out, running tests anyway");
          runTests();
        }
      };

      initAuth();
    }
  }, [isInitialized, results, loading]);

  const runTests = async () => {
    setLoading(true);
    setResults(null);

    try {
      // First, ensure auth is initialized or at least attempted
      if (!isInitialized) {
        try {
          await initialize();
          // Wait a bit for initialization to complete
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error("Failed to initialize auth:", err);
        }
      }

      // Check API health first
      const healthResult = await healthCheck();

      // Then ping the API to check connectivity
      const pingResult = await pingSupabase();

      // Finally test database tables
      const dbResult = await testDatabaseTables();

      setResults({
        health: healthResult,
        ping: pingResult,
        database: dbResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error running tests:", error);
      setResults({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
        <Button
          onClick={runTests}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {loading ? "Running tests..." : "Run tests again"}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Running connection tests...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          {results.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Test Failed</AlertTitle>
              <AlertDescription>{results.error}</AlertDescription>
            </Alert>
          ) : (
            <Alert
              variant={
                results.health?.success &&
                results.ping?.success &&
                results.database?.success
                  ? "default"
                  : "destructive"
              }
            >
              {results.health?.success &&
              results.ping?.success &&
              results.database?.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {results.health?.success &&
                results.ping?.success &&
                results.database?.success
                  ? "Connection Successful"
                  : "Connection Issues Detected"}
              </AlertTitle>
              <AlertDescription>
                {results.health?.success &&
                results.ping?.success &&
                results.database?.success
                  ? "All tests passed successfully."
                  : "Some tests failed. See details below."}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-2">
                Authentication Status
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Initialization:</span>
                  <Badge variant={isInitialized ? "success" : "destructive"}>
                    {isInitialized ? "Complete" : "Not Initialized"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authenticated User:</span>
                  <Badge variant={user ? "success" : "destructive"}>
                    {user ? `${user.email ?? user.id}` : "Not Authenticated"}
                  </Badge>
                </div>
                {results.database?.results?.authentication && (
                  <div className="flex items-center justify-between">
                    <span>Test Authentication:</span>
                    <Badge
                      variant={
                        results.database.results.authentication.success
                          ? "success"
                          : "destructive"
                      }
                    >
                      {results.database.results.authentication.success
                        ? "Successful"
                        : results.database.results.authentication.error
                            ?.message || "Failed"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-2">API Health Check</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge
                    variant={
                      results.health?.success ? "success" : "destructive"
                    }
                  >
                    {results.health?.success ? "Healthy" : "Unhealthy"}
                  </Badge>
                </div>
                {results.health?.message && (
                  <div className="text-sm mt-2">
                    <p className="font-medium">Message:</p>
                    <p>{results.health.message}</p>
                  </div>
                )}
                {results.health?.error && (
                  <div className="text-sm mt-2 text-red-500">
                    <p className="font-medium">Error:</p>
                    <p>{JSON.stringify(results.health.error)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-2">
                API Connectivity Test
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge
                    variant={results.ping?.success ? "success" : "destructive"}
                  >
                    {results.ping?.success ? "Connected" : "Failed"}
                  </Badge>
                </div>
                {results.ping?.message && (
                  <div className="text-sm mt-2">
                    <p className="font-medium">Message:</p>
                    <p>{results.ping.message}</p>
                  </div>
                )}
                {results.ping?.apiKeyValid !== undefined && (
                  <div className="flex items-center justify-between">
                    <span>API Key:</span>
                    <Badge
                      variant={
                        results.ping.apiKeyValid ? "success" : "destructive"
                      }
                    >
                      {results.ping.apiKeyValid
                        ? "Valid"
                        : "Invalid or Expired"}
                    </Badge>
                  </div>
                )}
                {results.ping?.error && (
                  <div className="text-sm mt-2 text-red-500">
                    <p className="font-medium">Error:</p>
                    <p>{JSON.stringify(results.ping.error)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-2">Database Tables Test</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Overall Status:</span>
                  <Badge
                    variant={
                      results.database?.success ? "success" : "destructive"
                    }
                  >
                    {results.database?.success ? "Successful" : "Failed"}
                  </Badge>
                </div>

                {results.database?.message && (
                  <div className="text-sm mt-2">
                    <p className="font-medium">Message:</p>
                    <p>{results.database.message}</p>
                  </div>
                )}

                {results.database?.results && (
                  <div className="mt-4 space-y-3">
                    <p className="font-medium">Table Results:</p>

                    {Object.entries(results.database.results).map(
                      ([table, result]: [string, TestResult]) => (
                        <div key={table} className="border rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{table}:</span>
                            <Badge
                              variant={
                                result.success ? "success" : "destructive"
                              }
                            >
                              {result.success
                                ? "Access Granted"
                                : "Access Denied"}
                            </Badge>
                          </div>

                          {!result.success && result.error && (
                            <div className="text-sm mt-2 text-red-500">
                              <p>
                                <span className="font-medium">Error:</span>{" "}
                                {result.error.message}
                              </p>
                              {result.error.code && (
                                <p>
                                  <span className="font-medium">Code:</span>{" "}
                                  {result.error.code}
                                </p>
                              )}
                              {result.error.hint && (
                                <p>
                                  <span className="font-medium">Hint:</span>{" "}
                                  {result.error.hint}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Test run at: {new Date(results.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
