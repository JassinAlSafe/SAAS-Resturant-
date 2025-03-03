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
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  HardDrive,
  AreaChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SetupStorageBucket() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Check if the bucket already exists
  const checkBucketStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/check-storage-status");
      if (response.ok) {
        const data = await response.json();
        setBucketExists(data.bucketExists);
      } else {
        setBucketExists(null);
      }
    } catch (error) {
      console.error("Error checking bucket status:", error);
      setBucketExists(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Check current storage policies
  const checkPolicies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/check-storage-policies");
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
        setShowDiagnostics(true);

        setResult({
          success: true,
          message: data.bucketExists
            ? `Found ${
                data.policies?.length || 0
              } policies for bucket business_assets`
            : "Bucket does not exist",
          details: data,
        });
      } else {
        const errorData = await response.json();
        setResult({
          success: false,
          message: errorData.message || "Failed to check policies",
          details: errorData,
        });
      }
    } catch (error) {
      console.error("Error checking policies:", error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBucketStatus();
  }, []);

  const setupBucket = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Force parameter ensures we recreate policies
      const response = await fetch("/api/setup-storage-bucket?force=true");
      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data,
        });

        // Refresh bucket status
        await checkBucketStatus();

        // Check updated policies
        await checkPolicies();
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to set up storage bucket",
          details: data.details || data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while setting up the bucket",
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Storage Setup</CardTitle>
            <CardDescription>
              Set up the storage bucket required for uploading logos and other
              business assets
            </CardDescription>
          </div>
          {bucketExists !== null && !isChecking && (
            <Badge variant={bucketExists ? "success" : "destructive"}>
              {bucketExists ? "Bucket Exists" : "Bucket Missing"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
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

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">
              {isChecking ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Checking storage status...
                </span>
              ) : bucketExists ? (
                <span className="text-green-600">
                  Storage bucket is set up and ready to use
                </span>
              ) : (
                <span className="text-amber-600">
                  Storage bucket needs to be set up before you can upload files
                </span>
              )}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            This will create the necessary storage bucket and set up proper
            security policies to store your restaurant logo and other assets. If
            you&apos;re having trouble uploading your logo, click the button
            below to set up the required infrastructure.
          </p>
        </div>

        {showDiagnostics && policies && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <AreaChart className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">
                Storage Policies ({policies.length})
              </p>
            </div>

            {policies.length === 0 ? (
              <p className="text-sm text-amber-600">
                No policies found for business_assets bucket
              </p>
            ) : (
              <ul className="text-sm space-y-1 pl-7 list-disc">
                {policies.map((policy, idx) => (
                  <li key={idx} className="text-xs">
                    <span className="font-mono">{policy.policyname}</span> (
                    {policy.permissive ? "PERMISSIVE" : "RESTRICTIVE"})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={setupBucket}
          disabled={isLoading || isChecking}
          variant={bucketExists ? "outline" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              {result?.success || bucketExists ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {bucketExists ? "Refresh Bucket Setup" : "Setup Complete"}
                </>
              ) : (
                "Setup Storage Bucket"
              )}
            </>
          )}
        </Button>

        <Button
          onClick={checkPolicies}
          disabled={isLoading}
          variant="secondary"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Check Policies"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SetupStorageBucket;
